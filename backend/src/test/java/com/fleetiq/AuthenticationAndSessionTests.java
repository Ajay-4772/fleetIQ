package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.*;
import com.fleetiq.model.PasswordResetToken;
import com.fleetiq.model.RefreshToken;
import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import com.fleetiq.repository.PasswordResetTokenRepository;
import com.fleetiq.repository.RefreshTokenRepository;
import com.fleetiq.repository.UserAuditLogRepository;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthenticationAndSessionTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private UserAuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Auth-01: Login with username succeeds and issues access & rotatable refresh tokens")
    void testLoginWithUsernameSuccess() throws Exception {
        LoginRequest req = new LoginRequest("admin", "Admin@Vehyron2026");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andReturn();

        Map<String, Object> resp = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        String refreshToken = (String) resp.get("refreshToken");

        var tokenOpt = refreshTokenRepository.findByTokenHash(refreshToken);
        assertTrue(tokenOpt.isPresent(), "Refresh token must be persisted in database");
        assertFalse(tokenOpt.get().isRevoked(), "New refresh token must not be revoked");
        assertFalse(tokenOpt.get().isExpired(), "New refresh token must not be expired");
    }

    @Test
    @DisplayName("Auth-02: Login with corporate email succeeds")
    void testLoginWithEmailSuccess() throws Exception {
        LoginRequest req = new LoginRequest("operator@vehyron.internal", "Operator@Vehyron2026");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("operator"))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"));
    }

    @Test
    @DisplayName("Auth-03: Login failure with wrong password records failed attempts and audit log")
    void testLoginFailureWrongPassword() throws Exception {
        String testUser = "wrong_pass_user_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("RealPassword2026!"), "Wrong Pass User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        userRepository.save(user);

        LoginRequest req = new LoginRequest(testUser, "WrongPassword123!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("BAD_CREDENTIALS"));

        var logs = auditLogRepository.findByTargetUsernameOrderByTimestampDesc(testUser);
        assertFalse(logs.isEmpty());
        assertEquals("LOGIN_FAILURE", logs.get(0).getAction());
    }

    @Test
    @DisplayName("Auth-04: Account lockout triggered after consecutive failed attempts")
    void testAccountLockout() throws Exception {
        String testUser = "lockout_test_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("SecurePass2026!"), "Lockout User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        userRepository.save(user);

        // Perform 5 consecutive failed logins
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(testUser, "BadPassword!"))))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt should be rejected with 423 Locked
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(testUser, "BadPassword!"))))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value("ACCOUNT_LOCKED"));
    }

    @Test
    @DisplayName("Auth-05: Deactivated account rejected with 403 Forbidden")
    void testDeactivatedAccountRejected() throws Exception {
        String testUser = "disabled_user_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("SecurePass2026!"), "Disabled User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        user.setEnabled(false);
        userRepository.save(user);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(testUser, "SecurePass2026!"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_DISABLED"));
    }

    @Test
    @DisplayName("Auth-06: Self-service registration creates user with restricted ROLE_OPERATOR and hashed password")
    void testSelfServiceRegistration() throws Exception {
        String testUser = "reg_user_" + System.currentTimeMillis();
        String testEmail = testUser + "@enterprise.com";

        RegisterRequest req = new RegisterRequest(
                "Registered Engineer",
                testEmail,
                testUser,
                "EnterpriseStrongPass2026!",
                "Enterprise Fleet Logistics",
                true
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(testUser))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());

        var userOpt = userRepository.findByUsername(testUser);
        assertTrue(userOpt.isPresent());
        assertEquals(Role.ROLE_OPERATOR, userOpt.get().getRole(), "Must strictly assign restricted ROLE_OPERATOR");
        assertTrue(passwordEncoder.matches("EnterpriseStrongPass2026!", userOpt.get().getPassword()));
    }

    @Test
    @DisplayName("Auth-07: Duplicate username registration is rejected with 400 Bad Request")
    void testDuplicateRegistrationRejected() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "Duplicate Admin",
                "another_admin@enterprise.com",
                "admin", // already exists
                "EnterpriseStrongPass2026!",
                "Logistics",
                true
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("REGISTRATION_VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Auth-08: Weak password violates password policy")
    void testPasswordPolicyValidation() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "Weak User",
                "weak@enterprise.com",
                "weak_user_" + System.currentTimeMillis(),
                "weak", // violates policy: < 8 chars, no uppercase, no numbers
                "Logistics",
                true
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Auth-09: Forgot password generates single-use reset token and generic response")
    void testForgotPasswordFlow() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest("admin@vehyron.internal");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        var adminUser = userRepository.findByUsername("admin").orElseThrow();
        var tokens = resetTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(adminUser.getId()) && !t.isUsed())
                .toList();

        assertFalse(tokens.isEmpty(), "Reset token must be persisted in database");
    }

    @Test
    @DisplayName("Auth-10: Reset password updates password, marks token used, and revokes active sessions")
    void testResetPasswordFlow() throws Exception {
        String testUser = "reset_user_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("OldPass2026!"), "Reset User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        user = userRepository.save(user);

        // Create an active refresh token
        RefreshToken activeSession = new RefreshToken("sess_token_" + System.currentTimeMillis(), user, java.time.Instant.now().plusSeconds(3600), "127.0.0.1", "Test");
        refreshTokenRepository.save(activeSession);

        // Create reset token
        String resetTokenStr = "rst_token_" + System.currentTimeMillis();
        PasswordResetToken resetToken = new PasswordResetToken(resetTokenStr, user, java.time.Instant.now().plusSeconds(3600));
        resetTokenRepository.save(resetToken);

        // Execute reset
        ResetPasswordRequest req = new ResetPasswordRequest(resetTokenStr, "BrandNewPass2026!", "BrandNewPass2026!");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // Verify password changed
        var updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("BrandNewPass2026!", updatedUser.getPassword()));

        // Verify reset token marked used
        var updatedResetToken = resetTokenRepository.findByTokenHash(resetTokenStr).orElseThrow();
        assertTrue(updatedResetToken.isUsed());

        // Verify active sessions revoked
        var updatedSession = refreshTokenRepository.findById(activeSession.getId()).orElseThrow();
        assertTrue(updatedSession.isRevoked(), "Resetting password must revoke all previous refresh tokens");

        // Attempting to reuse the same reset token is rejected
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PASSWORD_RESET_ERROR"));
    }

    @Test
    @DisplayName("Auth-11: Refresh token rotation issues new access token and revokes old refresh token")
    void testRefreshTokenRotation() throws Exception {
        LoginRequest login = new LoginRequest("operator", "Operator@Vehyron2026");
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> map = objectMapper.readValue(res.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        String oldRefreshToken = (String) map.get("refreshToken");

        // Call /api/v1/auth/refresh
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(oldRefreshToken);
        MvcResult refreshRes = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn();

        Map<String, Object> refreshMap = objectMapper.readValue(refreshRes.getResponse().getContentAsString(), new TypeReference<Map<String, Object>>() {});
        String newRefreshToken = (String) refreshMap.get("refreshToken");

        assertNotEquals(oldRefreshToken, newRefreshToken, "Refresh token must rotate upon use");

        // Old refresh token must now be revoked
        var oldTokenEntity = refreshTokenRepository.findByTokenHash(oldRefreshToken).orElseThrow();
        assertTrue(oldTokenEntity.isRevoked());

        // Reusing the old refresh token must be rejected with 401
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(oldRefreshToken))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    @DisplayName("Auth-12: Logout revokes refresh token")
    void testLogoutRevokesToken() throws Exception {
        String testUser = "logout_user_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("SecurePass2026!"), "Logout User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(testUser, "ROLE_OPERATOR");
        String refreshHash = "refr_logout_" + System.currentTimeMillis();
        RefreshToken refreshToken = new RefreshToken(refreshHash, user, java.time.Instant.now().plusSeconds(3600), "127.0.0.1", "Test");
        refreshTokenRepository.save(refreshToken);

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshHash))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        var tokenEntity = refreshTokenRepository.findByTokenHash(refreshHash).orElseThrow();
        assertTrue(tokenEntity.isRevoked(), "Refresh token must be marked revoked upon logout");
    }

    @Test
    @DisplayName("Auth-13: Real-time authorization reflection and instant session deactivation")
    void testRealTimeAuthorizationAndDeactivation() throws Exception {
        String testUser = "realtime_user_" + System.currentTimeMillis();
        User user = new User(testUser, passwordEncoder.encode("SecurePass2026!"), "Realtime User", testUser + "@vehyron.internal", Role.ROLE_OPERATOR, "Ops");
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(testUser, "ROLE_OPERATOR");

        // 1. Operator cannot access admin API
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 2. Admin elevates user to ROLE_ADMIN in DB
        user.setRole(Role.ROLE_ADMIN);
        userRepository.save(user);

        // 3. Next request with the exact same token immediately succeeds!
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 4. Admin deactivates user in DB
        user.setEnabled(false);
        userRepository.save(user);

        // 5. Next request with the exact same token is immediately rejected with 401 Unauthorized
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
