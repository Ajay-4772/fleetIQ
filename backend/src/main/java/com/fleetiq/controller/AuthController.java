package com.fleetiq.controller;

import com.fleetiq.dto.LoginRequest;
import com.fleetiq.dto.LoginResponse;
import com.fleetiq.dto.UserProfileDto;
import com.fleetiq.model.User;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.repository.UserAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final UserRepository userRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          UserAuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            auditLogRepository.save(new UserAuditLog(
                    request.getUsername(),
                    "LOGIN_FAILURE",
                    request.getUsername(),
                    "Authentication failed: invalid credentials",
                    ip
            ));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        User user = userOpt.get();
        if (!user.isEnabled()) {
            auditLogRepository.save(new UserAuditLog(
                    user.getUsername(),
                    "LOGIN_FAILURE",
                    user.getUsername(),
                    "Authentication blocked: account is deactivated",
                    ip
            ));
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User account is disabled");
        }

        auditLogRepository.save(new UserAuditLog(
                user.getUsername(),
                "LOGIN_SUCCESS",
                user.getUsername(),
                "Session created with active role: " + user.getRole().name(),
                ip
        ));

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());
        LoginResponse response = new LoginResponse(
                token,
                user.getUsername(),
                user.getFullName(),
                user.getRole().name(),
                tokenProvider.getExpirationMs()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName()
                : "anonymous";

        auditLogRepository.save(new UserAuditLog(
                username,
                "LOGOUT",
                username,
                "User terminated active session",
                getClientIp(httpRequest)
        ));

        return ResponseEntity.ok(Map.of("message", "Logged out successfully", "status", "SUCCESS"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            // Service principal or API key
            return ResponseEntity.ok(new UserProfileDto(username, "External Integration Principal", auth.getAuthorities().toString()));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new UserProfileDto(user.getUsername(), user.getFullName(), user.getRole().name()));
    }
}
