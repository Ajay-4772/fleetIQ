package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.CreateUserRequest;
import com.fleetiq.model.Role;
import com.fleetiq.repository.UserAuditLogRepository;
import com.fleetiq.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminUserAndRbacTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAuditLogRepository auditLogRepository;

    @Autowired
    private com.fleetiq.security.JwtTokenProvider tokenProvider;

    @Test
    @DisplayName("RBAC: unauthenticated request to admin API returns 401 Unauthorized")
    void testUnauthenticatedAdminAccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("RBAC: non-admin roles (Viewer/Operator) are forbidden from admin user management")
    @WithMockUser(username = "operator_joe", roles = {"OPERATOR"})
    void testOperatorForbiddenFromAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("Admin: authorized administrator can list users")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$[0].username").isNotEmpty())
                .andExpect(jsonPath("$[0].role").isNotEmpty());
    }

    @Test
    @DisplayName("Admin: create user successfully records user and audit log")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminCreateUserAndAudit() throws Exception {
        String testUsername = "lead_tech_" + System.currentTimeMillis();
        CreateUserRequest req = new CreateUserRequest(testUsername, "TechSecurePassword2026!", "Lead Technician", Role.ROLE_OPERATOR);

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(testUsername))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"))
                .andExpect(jsonPath("$.enabled").value(true));

        var userOpt = userRepository.findByUsername(testUsername);
        assertTrue(userOpt.isPresent(), "User should be persisted in database");
        assertFalse(userOpt.get().getPassword().equals("TechSecurePassword2026!"), "Password must be BCrypt hashed");

        var auditLogs = auditLogRepository.findByTargetUsernameOrderByTimestampDesc(testUsername);
        assertFalse(auditLogs.isEmpty(), "Audit log entry should be created for USER_CREATED action");
    }

    @Test
    @DisplayName("Admin: update user status to deactivated")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdminDeactivateUser() throws Exception {
        String testUsername = "deact_" + System.currentTimeMillis();
        CreateUserRequest req = new CreateUserRequest(testUsername, "TempPass2026!", "Temp User", Role.ROLE_OPERATOR);

        String response = mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long userId = objectMapper.readTree(response).get("id").asLong();

        // Deactivate user
        mockMvc.perform(patch("/api/v1/admin/users/" + userId + "/status")
                        .param("enabled", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        var user = userRepository.findById(userId).orElseThrow();
        assertFalse(user.isEnabled(), "User should now be disabled in database");
    }

    @Test
    @DisplayName("Security: instant session revocation upon deactivation blocks requests with valid JWT")
    void testInstantRevocationOnDeactivation() throws Exception {
        String testUsername = "instant_deact_" + System.currentTimeMillis();
        // Create user directly in DB
        com.fleetiq.model.User user = new com.fleetiq.model.User(
                testUsername,
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("SecurePass2026!"),
                "Instant Deact User",
                Role.ROLE_OPERATOR
        );
        user = userRepository.save(user);

        // Generate valid token for this user using autowired provider
        String token = tokenProvider.generateToken(testUsername, "ROLE_OPERATOR");

        // Request with active user succeeds
        mockMvc.perform(get("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Deactivate user in DB
        user.setEnabled(false);
        userRepository.save(user);

        // Immediately, the very next request with the exact same valid JWT is rejected with 401
        mockMvc.perform(get("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: real-time role mutation takes effect immediately on subsequent requests")
    void testRealTimeRoleReflection() throws Exception {
        String testUsername = "role_switch_" + System.currentTimeMillis();
        com.fleetiq.model.User user = new com.fleetiq.model.User(
                testUsername,
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("SecurePass2026!"),
                "Role Switch User",
                Role.ROLE_OPERATOR
        );
        user = userRepository.save(user);

        // Token minted with ROLE_OPERATOR
        String token = tokenProvider.generateToken(testUsername, "ROLE_OPERATOR");

        // /api/v1/admin/users requires ROLE_ADMIN -> should be forbidden for OPERATOR
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // Elevate user role in DB to ROLE_ADMIN
        user.setRole(Role.ROLE_ADMIN);
        userRepository.save(user);

        // The very next request with the same token should now succeed as ADMIN!
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Auth: login failure and success create structured audit logs")
    void testAuthAuditLogging() throws Exception {
        com.fleetiq.dto.LoginRequest badReq = new com.fleetiq.dto.LoginRequest("nonexistent_user", "wrong_pass");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badReq)))
                .andExpect(status().isUnauthorized());

        var logs = auditLogRepository.findByTargetUsernameOrderByTimestampDesc("nonexistent_user");
        assertFalse(logs.isEmpty(), "Audit log must contain failed login attempt");
        assertTrue(logs.get(0).getAction().equals("LOGIN_FAILURE"));
    }
}
