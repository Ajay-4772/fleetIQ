package com.fleetiq.dto;

import java.util.Map;

public class IngestionRequest {
    private String source;
    private Map<String, Object> payload;

    public IngestionRequest() {}

    public IngestionRequest(String source, Map<String, Object> payload) {
        this.source = source;
        this.payload = payload;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}
