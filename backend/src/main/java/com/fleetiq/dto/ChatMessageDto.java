package com.fleetiq.dto;

import com.fleetiq.model.ChatMessage;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ChatMessageDto {

    private String id;
    private String role;
    private String content;
    private String queryType;
    private List<String> sources;
    private String evidence;
    private Double confidence;
    private String modelProvider;
    private Instant createdAt;

    public ChatMessageDto() {}

    public ChatMessageDto(ChatMessage msg) {
        this.id = msg.getId();
        this.role = msg.getRole();
        this.content = msg.getContent();
        this.queryType = msg.getQueryType();
        this.evidence = msg.getEvidence();
        this.confidence = msg.getConfidence();
        this.modelProvider = msg.getModelProvider();
        this.createdAt = msg.getCreatedAt();
        if (msg.getSources() != null && !msg.getSources().isBlank()) {
            this.sources = Arrays.asList(msg.getSources().split(";\\s*"));
        } else {
            this.sources = Collections.emptyList();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getQueryType() { return queryType; }
    public void setQueryType(String queryType) { this.queryType = queryType; }

    public List<String> getSources() { return sources; }
    public void setSources(List<String> sources) { this.sources = sources; }

    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getModelProvider() { return modelProvider; }
    public void setModelProvider(String modelProvider) { this.modelProvider = modelProvider; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
