package com.fleetiq.service.assistant;

import java.time.Instant;
import java.util.List;

public class AssistantResponseDto {
    private String answer;
    private String queryType; // LIVE_DATA, KNOWLEDGE_RAG, HYBRID
    private List<String> sources;
    private Object supportingData;
    private String recommendedAction;
    private double confidence;
    private String aiProviderStatus;
    private String timestamp;

    public AssistantResponseDto() {
        this.timestamp = Instant.now().toString();
    }

    public AssistantResponseDto(String answer, String queryType, List<String> sources,
                                Object supportingData, String recommendedAction,
                                double confidence, String aiProviderStatus) {
        this.answer = answer;
        this.queryType = queryType;
        this.sources = sources;
        this.supportingData = supportingData;
        this.recommendedAction = recommendedAction;
        this.confidence = confidence;
        this.aiProviderStatus = aiProviderStatus;
        this.timestamp = Instant.now().toString();
    }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getQueryType() { return queryType; }
    public void setQueryType(String queryType) { this.queryType = queryType; }

    public List<String> getSources() { return sources; }
    public void setSources(List<String> sources) { this.sources = sources; }

    public Object getSupportingData() { return supportingData; }
    public void setSupportingData(Object supportingData) { this.supportingData = supportingData; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getAiProviderStatus() { return aiProviderStatus; }
    public void setAiProviderStatus(String aiProviderStatus) { this.aiProviderStatus = aiProviderStatus; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
