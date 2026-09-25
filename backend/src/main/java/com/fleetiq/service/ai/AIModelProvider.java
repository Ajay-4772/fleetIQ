package com.fleetiq.service.ai;

import com.fleetiq.service.assistant.AssistantResponseDto;
import com.fleetiq.service.rag.RagChunk;

import java.util.List;

public interface AIModelProvider {

    String getProviderId();

    boolean isAvailable();

    AssistantResponseDto generateResponse(String prompt, String userContext, List<RagChunk> ragKnowledge);
}
