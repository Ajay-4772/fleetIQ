package com.fleetiq.controller;

import com.fleetiq.dto.ChatConversationDetailDto;
import com.fleetiq.dto.ChatConversationDto;
import com.fleetiq.dto.ChatMessageDto;
import com.fleetiq.dto.SendMessageRequest;
import com.fleetiq.service.assistant.CopilotChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assistant/conversations")
public class CopilotChatController {

    private final CopilotChatService copilotChatService;

    public CopilotChatController(CopilotChatService copilotChatService) {
        this.copilotChatService = copilotChatService;
    }

    @GetMapping
    public ResponseEntity<List<ChatConversationDto>> getUserConversations(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(copilotChatService.getUserConversations(username));
    }

    @PostMapping
    public ResponseEntity<ChatConversationDto> createConversation(@RequestParam(required = false) String title,
                                                                 Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        ChatConversationDto created = copilotChatService.createConversation(username, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatConversationDetailDto> getConversationDetails(@PathVariable String id,
                                                                            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(copilotChatService.getConversationDetails(id, username));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(@PathVariable String id,
                                                       @Valid @RequestBody SendMessageRequest request,
                                                       Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        ChatMessageDto reply = copilotChatService.sendMessage(id, username, request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ChatConversationDto> renameConversation(@PathVariable String id,
                                                                  @RequestParam String title,
                                                                  Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        return ResponseEntity.ok(copilotChatService.renameConversation(id, username, title));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String id,
                                                   Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        copilotChatService.deleteConversation(id, username);
        return ResponseEntity.noContent().build();
    }
}
