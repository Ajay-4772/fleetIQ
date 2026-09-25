package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.ActionStatusUpdateRequest;
import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.LoginRequest;
import com.fleetiq.dto.LoginResponse;
import com.fleetiq.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityAndAuthTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Case S1: Login success with valid admin credentials")
    void testLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("admin", "Admin@FleetIQ2026");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andReturn();

        LoginResponse res = objectMapper.readValue(result.getResponse().getContentAsString(), LoginResponse.class);
        assertTrue(jwtTokenProvider.validateToken(res.getToken()));
        assertEquals("admin", jwtTokenProvider.getUsernameFromToken(res.getToken()));
        assertEquals("ROLE_ADMIN", jwtTokenProvider.getRoleFromToken(res.getToken()));
    }

    @Test
    @DisplayName("Case S2: Login failure with invalid password")
    void testLoginFailure() throws Exception {
        LoginRequest req = new LoginRequest("admin", "WrongPassword123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Case S3: Viewer role is forbidden from mutating actions (RBAC check)")
    void testViewerForbiddenFromMutatingAction() throws Exception {
        String viewerToken = jwtTokenProvider.generateToken("viewer", "ROLE_VIEWER");
        ActionStatusUpdateRequest update = new ActionStatusUpdateRequest("RESOLVED", "Attempted by viewer");

        mockMvc.perform(patch("/api/v1/actions/ACT-0001/status")
                        .header("Authorization", "Bearer " + viewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Case S4: Operator role is authorized to mutate action status")
    void testOperatorAuthorizedToMutateAction() throws Exception {
        String operatorToken = jwtTokenProvider.generateToken("operator", "ROLE_OPERATOR");
        ActionStatusUpdateRequest update = new ActionStatusUpdateRequest("IN_PROGRESS", "Assigned technician");

        // May return 200 (if ACT-0001 exists) or 400 (if invalid action ID), but NEVER 403 Forbidden
        mockMvc.perform(patch("/api/v1/actions/ACT-0001/status")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 400, "Expected 200 or 400, got: " + status);
                });
    }

    @Test
    @DisplayName("Case S5: Service-to-service ingestion allowed with valid X-API-Key")
    void testServiceToServiceIngestionWithApiKey() throws Exception {
        IngestionRequest req = new IngestionRequest(
                "SIMULATED_TOYOTA",
                "EVT-TEST-APIKEY",
                "VH-1001",
                null,
                Map.of("vehicle_id", "VH-1001", "oil_life", 45.0, "odometer", 52000L),
                "idemp-apikey-1",
                "corr-apikey-1"
        );

        mockMvc.perform(post("/api/v1/events/ingest")
                        .header("X-API-Key", "fleetiq-ingest-secure-key-2026")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 201 || status == 200, "Expected 201 or 200, got: " + status);
                });
    }

    @Test
    @DisplayName("Case S6: Anonymous ingestion rejected without token or API key")
    void testAnonymousIngestionForbidden() throws Exception {
        IngestionRequest req = new IngestionRequest("SIMULATED_TOYOTA", Map.of("vehicle_id", "VH-1001"));

        mockMvc.perform(post("/api/v1/events/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }
}
