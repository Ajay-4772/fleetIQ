package com.fleetiq.controller;

import com.fleetiq.dto.*;
import com.fleetiq.model.User;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.service.auth.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private String getUserAgent(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        return (ua != null && !ua.isBlank()) ? ua : "Unknown Client";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        String ua = getUserAgent(httpRequest);

        try {
            AuthTokensResponse tokens = authService.login(request, ip, ua);
            // Include backward compatible fields so existing clients function seamlessly
            Map<String, Object> response = Map.of(
                    "token", tokens.getAccessToken(),
                    "accessToken", tokens.getAccessToken(),
                    "refreshToken", tokens.getRefreshToken(),
                    "tokenType", tokens.getTokenType(),
                    "expiresInMs", tokens.getExpiresInMs(),
                    "username", tokens.getUsername(),
                    "fullName", tokens.getFullName(),
                    "email", tokens.getEmail() != null ? tokens.getEmail() : "",
                    "role", tokens.getRole(),
                    "organization", tokens.getOrganization() != null ? tokens.getOrganization() : ""
            );
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Unauthorized",
                    "code", "BAD_CREDENTIALS",
                    "message", "Invalid username or password"
            ));
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "status", 403,
                    "error", "Forbidden",
                    "code", "ACCOUNT_DISABLED",
                    "message", e.getMessage()
            ));
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of(
                    "status", 423,
                    "error", "Locked",
                    "code", "ACCOUNT_LOCKED",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        try {
            AuthTokensResponse tokens = authService.register(request, ip);
            Map<String, Object> response = Map.of(
                    "token", tokens.getAccessToken(),
                    "accessToken", tokens.getAccessToken(),
                    "refreshToken", tokens.getRefreshToken(),
                    "username", tokens.getUsername(),
                    "fullName", tokens.getFullName(),
                    "email", tokens.getEmail(),
                    "role", tokens.getRole(),
                    "message", "Registration successful. Welcome to FleetIQ."
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "code", "REGISTRATION_VALIDATION_ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        String ua = getUserAgent(httpRequest);
        try {
            AuthTokensResponse tokens = authService.refreshToken(request, ip, ua);
            return ResponseEntity.ok(tokens);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Unauthorized",
                    "code", "INVALID_REFRESH_TOKEN",
                    "message", e.getMessage()
            ));
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "status", 403,
                    "error", "Forbidden",
                    "code", "ACCOUNT_DISABLED",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        Map<String, String> result = authService.forgotPassword(request, ip);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        try {
            Map<String, String> result = authService.resetPassword(request, ip);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", 400,
                    "error", "Bad Request",
                    "code", "PASSWORD_RESET_ERROR",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> body, HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName()
                : "anonymous";

        String refreshToken = body != null ? body.get("refreshToken") : null;
        authService.logout(username, refreshToken, getClientIp(httpRequest));

        return ResponseEntity.ok(Map.of("message", "Logged out successfully", "status", "SUCCESS"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Unauthorized",
                    "message", "Not authenticated"
            ));
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new UserProfileDto(username, "External Integration Principal", auth.getAuthorities().toString()));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new UserProfileDto(user.getUsername(), user.getFullName(), user.getRole().name()));
    }
}
