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
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        User user = userOpt.get();
        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User account is disabled");
        }

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
