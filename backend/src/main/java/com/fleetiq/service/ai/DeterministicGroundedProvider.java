package com.fleetiq.service.ai;

import com.fleetiq.service.assistant.AiAssistantService;
import com.fleetiq.service.assistant.AssistantResponseDto;
import com.fleetiq.service.rag.RagChunk;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("deterministicGroundedProvider")
@Primary
public class DeterministicGroundedProvider implements AIModelProvider {

    private final AiAssistantService assistantService;

    public DeterministicGroundedProvider(AiAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @Override
    public String getProviderId() {
        return "DETERMINISTIC_GROUNDED";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AssistantResponseDto generateResponse(String prompt, String userContext, List<RagChunk> ragKnowledge) {
        return assistantService.processQuestion(prompt);
    }
}
