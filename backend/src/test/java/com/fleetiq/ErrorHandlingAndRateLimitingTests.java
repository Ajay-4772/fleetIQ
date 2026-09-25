package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ErrorHandlingAndRateLimitingTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Global Exception Handler: returns structured ApiErrorResponse on validation failure")
    void testValidationErrorResponse() throws Exception {
        // Empty username violates @NotBlank on LoginRequest
        LoginRequest invalid = new LoginRequest("", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.path").value("/api/v1/auth/login"))
                .andExpect(jsonPath("$.details", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    @DisplayName("Global Exception Handler: returns structured error when illegal arguments provided")
    @org.springframework.security.test.context.support.WithMockUser(username = "operator", roles = {"OPERATOR"})
    void testIllegalArgumentErrorResponse() throws Exception {
        // Query with missing/empty intent
        mockMvc.perform(post("/api/fleet/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"intent\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value(containsString("Query intent must not be empty")));
    }

    @Test
    @DisplayName("Security Exception Handling: returns structured JSON on unauthorized access")
    void testUnauthorizedErrorResponse() throws Exception {
        mockMvc.perform(post("/api/fleet/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"intent\":\"MAINTENANCE_REQUIRED\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Rate Limiting: triggers HTTP 429 when auth endpoint exceeds burst threshold")
    void testAuthRateLimitingTriggered() throws Exception {
        LoginRequest req = new LoginRequest("test_user_rate", "WrongPassword123!");
        String json = objectMapper.writeValueAsString(req);

        // Send 18 requests from simulated IP
        String testIp = "198.51.100.42";
        boolean rateLimited = false;

        for (int i = 0; i < 18; i++) {
            var result = mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", testIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andReturn();

            if (result.getResponse().getStatus() == 429) {
                rateLimited = true;
                break;
            }
        }

        org.junit.jupiter.api.Assertions.assertTrue(rateLimited, "Expected HTTP 429 Rate Limit Exceeded after 18 requests in 1 minute window");
    }
}
