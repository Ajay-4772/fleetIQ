package com.fleetiq.dto;

public class IngestionResponse {
    private String eventId;
    private String vehicleId;
    private String eventType;
    private String severity;
    private String status;
    private String actionId;
    private String priority;
    private String decisionSource;
    private String message;

    public IngestionResponse() {}

    public IngestionResponse(String eventId, String vehicleId, String eventType, String severity,
                             String status, String actionId, String priority, String decisionSource, String message) {
        this.eventId = eventId;
        this.vehicleId = vehicleId;
        this.eventType = eventType;
        this.severity = severity;
        this.status = status;
        this.actionId = actionId;
        this.priority = priority;
        this.decisionSource = decisionSource;
        this.message = message;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActionId() { return actionId; }
    public void setActionId(String actionId) { this.actionId = actionId; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDecisionSource() { return decisionSource; }
    public void setDecisionSource(String decisionSource) { this.decisionSource = decisionSource; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
