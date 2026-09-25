package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.SendMessageRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CopilotChatPersistenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Copilot: user can create conversation, post message, and receive grounded response")
    @WithMockUser(username = "analyst_carol", roles = {"VIEWER"})
    void testCreateConversationAndSendMessage() throws Exception {
        // 1. Create conversation
        String createRes = mockMvc.perform(post("/api/v1/assistant/conversations")
                        .param("title", "Battery Health Inquiry"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Battery Health Inquiry"))
                .andReturn().getResponse().getContentAsString();

        String convId = objectMapper.readTree(createRes).get("id").asText();

        // 2. Send message
        SendMessageRequest msgReq = new SendMessageRequest("What does fault code P0300 indicate?");
        mockMvc.perform(post("/api/v1/assistant/conversations/" + convId + "/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msgReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ASSISTANT"))
                .andExpect(jsonPath("$.content", containsString("P0300")))
                .andExpect(jsonPath("$.modelProvider").value("DETERMINISTIC_GROUNDED"))
                .andExpect(jsonPath("$.sources").isArray());

        // 3. Retrieve conversation history
        mockMvc.perform(get("/api/v1/assistant/conversations/" + convId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conversation.id").value(convId))
                .andExpect(jsonPath("$.messages", hasSize(2))) // 1 user + 1 assistant
                .andExpect(jsonPath("$.messages[0].role").value("USER"))
                .andExpect(jsonPath("$.messages[1].role").value("ASSISTANT"));
    }

    @Test
    @DisplayName("Copilot: strict user isolation prevents unauthorized cross-user conversation access")
    @WithMockUser(username = "user_alpha", roles = {"OPERATOR"})
    void testUserIsolationEnforced() throws Exception {
        // Alpha creates a conversation
        String createRes = mockMvc.perform(post("/api/v1/assistant/conversations")
                        .param("title", "Alpha Private Notes"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String convId = objectMapper.readTree(createRes).get("id").asText();

        // Alpha can read it
        mockMvc.perform(get("/api/v1/assistant/conversations/" + convId))
                .andExpect(status().isOk());

        // Now test as User Beta using request post-processor
        mockMvc.perform(get("/api/v1/assistant/conversations/" + convId)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("user_beta").roles("OPERATOR")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));

        // Beta attempts to send message to Alpha's conversation -> Must be rejected with 404
        SendMessageRequest msgReq = new SendMessageRequest("Intruding message");
        mockMvc.perform(post("/api/v1/assistant/conversations/" + convId + "/messages")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("user_beta").roles("OPERATOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msgReq)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }
}
