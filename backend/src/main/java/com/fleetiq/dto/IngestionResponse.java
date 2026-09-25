package com.fleetiq.dto;

public class IngestionResponse {
    private String eventId;
    private String correlationId;
    private String vehicleId;
    private String eventType;
    private String severity;
    private String status; // ACCEPTED / REJECTED / DUPLICATE / PROCESSED
    private String normalizedStatus;
    private String processingStatus;
    private String actionId;
    private String priority;
    private String decisionSource;
    private String message;
    private String reason;

    public IngestionResponse() {}

    public IngestionResponse(String eventId, String vehicleId, String eventType, String severity,
                             String status, String actionId, String priority, String decisionSource, String message) {
        this.eventId = eventId;
        this.vehicleId = vehicleId;
        this.eventType = eventType;
        this.severity = severity;
        this.status = status;
        this.processingStatus = status;
        this.normalizedStatus = "PROCESSED".equals(status) ? "NORMALIZED" : "FAILED";
        this.actionId = actionId;
        this.priority = priority;
        this.decisionSource = decisionSource;
        this.message = message;
    }

    public IngestionResponse(String eventId, String correlationId, String vehicleId, String eventType,
                             String severity, String status, String normalizedStatus, String processingStatus,
                             String actionId, String priority, String decisionSource, String message, String reason) {
        this.eventId = eventId;
        this.correlationId = correlationId;
        this.vehicleId = vehicleId;
        this.eventType = eventType;
        this.severity = severity;
        this.status = status;
        this.normalizedStatus = normalizedStatus;
        this.processingStatus = processingStatus;
        this.actionId = actionId;
        this.priority = priority;
        this.decisionSource = decisionSource;
        this.message = message;
        this.reason = reason;
    }

    public static IngestionResponse rejected(String eventId, String correlationId, String reason) {
        IngestionResponse res = new IngestionResponse();
        res.setEventId(eventId);
        res.setCorrelationId(correlationId);
        res.setStatus("FAILED");
        res.setProcessingStatus("REJECTED");
        res.setNormalizedStatus("FAILED");
        res.setMessage(reason);
        res.setReason(reason);
        return res;
    }

    public static IngestionResponse duplicate(String eventId, String correlationId, String message) {
        IngestionResponse res = new IngestionResponse();
        res.setEventId(eventId);
        res.setCorrelationId(correlationId);
        res.setStatus("DUPLICATE");
        res.setProcessingStatus("DUPLICATE");
        res.setNormalizedStatus("ALREADY_PROCESSED");
        res.setMessage(message);
        return res;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNormalizedStatus() { return normalizedStatus; }
    public void setNormalizedStatus(String normalizedStatus) { this.normalizedStatus = normalizedStatus; }

    public String getProcessingStatus() { return processingStatus; }
    public void setProcessingStatus(String processingStatus) { this.processingStatus = processingStatus; }

    public String getActionId() { return actionId; }
    public void setActionId(String actionId) { this.actionId = actionId; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDecisionSource() { return decisionSource; }
    public void setDecisionSource(String decisionSource) { this.decisionSource = decisionSource; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
