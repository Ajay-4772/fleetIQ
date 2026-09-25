package com.fleetiq.dto;

import java.time.Instant;
import java.util.UUID;

public class DashboardEventDto {
    private String eventId;
    private String correlationId;
    private String entityId;
    private String eventType;
    private String timestamp;
    private String vehicleId;
    private String make;
    private String severity;
    private String source;
    private String recommendedAction;
    private Double estimatedImpact;
    private String status;
    private Object data;

    public DashboardEventDto() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toString();
    }

    public DashboardEventDto(String eventType, String timestamp, String vehicleId, String make,
                             String severity, String source, String recommendedAction,
                             Double estimatedImpact, String status, Object data) {
        this.eventId = UUID.randomUUID().toString();
        this.correlationId = UUID.randomUUID().toString();
        this.entityId = vehicleId;
        this.eventType = eventType;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
        this.vehicleId = vehicleId;
        this.make = make;
        this.severity = severity;
        this.source = source;
        this.recommendedAction = recommendedAction;
        this.estimatedImpact = estimatedImpact;
        this.status = status;
        this.data = data;
    }

    public DashboardEventDto(String eventId, String correlationId, String entityId, String eventType,
                             String timestamp, String vehicleId, String make, String severity,
                             String source, String recommendedAction, Double estimatedImpact,
                             String status, Object data) {
        this.eventId = eventId != null ? eventId : UUID.randomUUID().toString();
        this.correlationId = correlationId != null ? correlationId : UUID.randomUUID().toString();
        this.entityId = entityId;
        this.eventType = eventType;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
        this.vehicleId = vehicleId;
        this.make = make;
        this.severity = severity;
        this.source = source;
        this.recommendedAction = recommendedAction;
        this.estimatedImpact = estimatedImpact;
        this.status = status;
        this.data = data;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public Double getEstimatedImpact() { return estimatedImpact; }
    public void setEstimatedImpact(Double estimatedImpact) { this.estimatedImpact = estimatedImpact; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
