package com.fleetiq.controller;

import com.fleetiq.service.assistant.AiAssistantService;
import com.fleetiq.service.assistant.AssistantQueryRequest;
import com.fleetiq.service.assistant.AssistantResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/assistant", "/api/assistant"})
public class AssistantController {

    private final AiAssistantService assistantService;

    public AssistantController(AiAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/query")
    public ResponseEntity<AssistantResponseDto> queryAssistant(@Valid @RequestBody AssistantQueryRequest request) {
        AssistantResponseDto response = assistantService.processQuestion(request.getQuestion());
        return ResponseEntity.ok(response);
    }
}
