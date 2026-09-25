package com.fleetiq.dto;

import java.util.Map;

public class IngestionRequest {
    private String source;
    private String eventId;
    private String vehicleId;
    private String timestamp;
    private Map<String, Object> payload;
    private String idempotencyKey;
    private String correlationId;

    public IngestionRequest() {}

    public IngestionRequest(String source, Map<String, Object> payload) {
        this.source = source;
        this.payload = payload;
    }

    public IngestionRequest(String source, String eventId, String vehicleId, String timestamp,
                            Map<String, Object> payload, String idempotencyKey, String correlationId) {
        this.source = source;
        this.eventId = eventId;
        this.vehicleId = vehicleId;
        this.timestamp = timestamp;
        this.payload = payload;
        this.idempotencyKey = idempotencyKey;
        this.correlationId = correlationId;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
}
