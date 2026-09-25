package com.fleetiq.service.auth;

import com.fleetiq.dto.*;
import com.fleetiq.model.PasswordResetToken;
import com.fleetiq.model.RefreshToken;
import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.repository.PasswordResetTokenRepository;
import com.fleetiq.repository.RefreshTokenRepository;
import com.fleetiq.repository.UserAuditLogRepository;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.security.JwtTokenProvider;
import com.fleetiq.security.PasswordPolicyValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;
    private static final int REFRESH_TOKEN_DAYS = 7;
    private static final int RESET_TOKEN_HOURS = 1;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordResetTokenRepository resetTokenRepository,
                       UserAuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       PasswordPolicyValidator passwordPolicyValidator) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.passwordPolicyValidator = passwordPolicyValidator;
    }

    private String generateSecureHexToken(int byteLength) {
        byte[] bytes = new byte[byteLength];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class, DisabledException.class, LockedException.class})
    public AuthTokensResponse login(LoginRequest request, String ip, String userAgent) {
        String identifier = request.getUsername().trim();
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier);

        if (userOpt.isEmpty()) {
            auditLogRepository.save(new UserAuditLog(
                    identifier,
                    "LOGIN_FAILURE",
                    identifier,
                    "Authentication failed: user identifier not found",
                    ip
            ));
            throw new BadCredentialsException("Invalid credentials provided");
        }

        User user = userOpt.get();

        if (!user.isAccountNonLocked()) {
            auditLogRepository.save(new UserAuditLog(
                    user.getUsername(),
                    "LOGIN_BLOCKED",
                    user.getUsername(),
                    "Authentication blocked: account temporarily locked until " + user.getLockedUntil(),
                    ip
            ));
            throw new LockedException("Account is temporarily locked due to repeated failed login attempts. Please retry later or contact your administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plus(LOCKOUT_MINUTES, ChronoUnit.MINUTES));
                log.warn("User {} locked out for {} minutes after {} failed attempts", user.getUsername(), LOCKOUT_MINUTES, attempts);
            }
            userRepository.save(user);

            auditLogRepository.save(new UserAuditLog(
                    user.getUsername(),
                    "LOGIN_FAILURE",
                    user.getUsername(),
                    "Authentication failed: invalid password (attempt " + attempts + "/" + MAX_FAILED_ATTEMPTS + ")",
                    ip
            ));
            throw new BadCredentialsException("Invalid credentials provided");
        }

        if (!user.isEnabled()) {
            auditLogRepository.save(new UserAuditLog(
                    user.getUsername(),
                    "LOGIN_BLOCKED",
                    user.getUsername(),
                    "Authentication rejected: user account is deactivated",
                    ip
            ));
            throw new DisabledException("Account has been deactivated. Please contact your FleetIQ Administrator.");
        }

        // Reset failed attempts upon successful login
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // Mint short-lived access token
        String accessToken = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        // Mint rotatable refresh token
        String refreshTokenStr = generateSecureHexToken(32);
        RefreshToken refreshToken = new RefreshToken(
                refreshTokenStr,
                user,
                Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS),
                ip,
                userAgent
        );
        refreshTokenRepository.save(refreshToken);

        auditLogRepository.save(new UserAuditLog(
                user.getUsername(),
                "LOGIN_SUCCESS",
                user.getUsername(),
                "Session created with role " + user.getRole().name(),
                ip
        ));

        return new AuthTokensResponse(
                accessToken,
                refreshTokenStr,
                tokenProvider.getExpirationMs(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getOrganization()
        );
    }

    @Transactional
    public AuthTokensResponse register(RegisterRequest request, String ip) {
        // Enforce password policy
        passwordPolicyValidator.validate(request.getPassword());

        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already registered in FleetIQ");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Corporate email '" + email + "' is already registered");
        }

        // Public registration assigns strictly restricted ROLE_VIEWER
        User user = new User(
                username,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                email,
                Role.ROLE_VIEWER,
                request.getOrganization() != null ? request.getOrganization().trim() : null
        );

        User saved = userRepository.save(user);

        auditLogRepository.save(new UserAuditLog(
                saved.getUsername(),
                "USER_REGISTERED",
                saved.getUsername(),
                "Self-service registration completed with default role ROLE_VIEWER",
                ip
        ));

        // Generate immediate session for onboarding
        String accessToken = tokenProvider.generateToken(saved.getUsername(), saved.getRole().name());
        String refreshTokenStr = generateSecureHexToken(32);
        RefreshToken refreshToken = new RefreshToken(
                refreshTokenStr,
                saved,
                Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS),
                ip,
                "Web Client"
        );
        refreshTokenRepository.save(refreshToken);

        return new AuthTokensResponse(
                accessToken,
                refreshTokenStr,
                tokenProvider.getExpirationMs(),
                saved.getUsername(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getOrganization()
        );
    }

    @Transactional
    public AuthTokensResponse refreshToken(RefreshTokenRequest request, String ip, String userAgent) {
        String tokenStr = request.getRefreshToken().trim();
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!storedToken.isValid()) {
            auditLogRepository.save(new UserAuditLog(
                    storedToken.getUser().getUsername(),
                    "REFRESH_FAILURE",
                    storedToken.getUser().getUsername(),
                    "Attempted refresh using revoked or expired token",
                    ip
            ));
            throw new IllegalArgumentException("Refresh token is expired or revoked. Please sign in again.");
        }

        User user = storedToken.getUser();
        if (!user.isEnabled()) {
            throw new DisabledException("Account has been deactivated.");
        }

        // Rotate: revoke current token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Issue new refresh token
        String newRefreshTokenStr = generateSecureHexToken(32);
        RefreshToken newRefreshToken = new RefreshToken(
                newRefreshTokenStr,
                user,
                Instant.now().plus(REFRESH_TOKEN_DAYS, ChronoUnit.DAYS),
                ip,
                userAgent
        );
        refreshTokenRepository.save(newRefreshToken);

        // Issue new access token with current DB role
        String newAccessToken = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        auditLogRepository.save(new UserAuditLog(
                user.getUsername(),
                "REFRESH_TOKEN_ROTATED",
                user.getUsername(),
                "Session refreshed with role " + user.getRole().name(),
                ip
        ));

        return new AuthTokensResponse(
                newAccessToken,
                newRefreshTokenStr,
                tokenProvider.getExpirationMs(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getOrganization()
        );
    }

    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request, String ip) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Invalidate any existing unused reset tokens
            resetTokenRepository.invalidateAllForUser(user);

            // Generate cryptographic 32-byte reset token
            String resetTokenStr = generateSecureHexToken(32);
            PasswordResetToken resetToken = new PasswordResetToken(
                    resetTokenStr,
                    user,
                    Instant.now().plus(RESET_TOKEN_HOURS, ChronoUnit.HOURS)
            );
            resetTokenRepository.save(resetToken);

            auditLogRepository.save(new UserAuditLog(
                    user.getUsername(),
                    "PASSWORD_RESET_REQUESTED",
                    user.getUsername(),
                    "Single-use password reset token generated",
                    ip
            ));

            log.info("Password reset token generated for user {}. Token: {}", user.getUsername(), resetTokenStr);
        }

        // Anti-account enumeration: always return the same generic message
        return Map.of(
                "message", "If an account matching that corporate email exists, password reset instructions have been dispatched.",
                "status", "SUCCESS"
        );
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request, String ip) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirmation password do not match");
        }

        passwordPolicyValidator.validate(request.getNewPassword());

        String tokenStr = request.getToken().trim();
        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(tokenStr)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("Password reset token has already been used or has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        // Mark token used
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        // Invalidate all active sessions / refresh tokens for security
        refreshTokenRepository.revokeAllForUser(user);

        auditLogRepository.save(new UserAuditLog(
                user.getUsername(),
                "PASSWORD_RESET_COMPLETED",
                user.getUsername(),
                "Password successfully updated via reset token; active sessions revoked",
                ip
        ));

        return Map.of(
                "message", "Password has been successfully updated. Please sign in with your new credentials.",
                "status", "SUCCESS"
        );
    }

    @Transactional
    public void logout(String username, String refreshTokenStr, String ip) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.findByTokenHash(refreshTokenStr.trim())
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }

        auditLogRepository.save(new UserAuditLog(
                username != null ? username : "anonymous",
                "LOGOUT",
                username != null ? username : "anonymous",
                "User ended session; refresh token revoked",
                ip
        ));
    }
}
