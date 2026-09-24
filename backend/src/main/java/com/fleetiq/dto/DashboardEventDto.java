package com.fleetiq.dto;

public class DashboardEventDto {
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

    public DashboardEventDto() {}

    public DashboardEventDto(String eventType, String timestamp, String vehicleId, String make,
                             String severity, String source, String recommendedAction,
                             Double estimatedImpact, String status, Object data) {
        this.eventType = eventType;
        this.timestamp = timestamp;
        this.vehicleId = vehicleId;
        this.make = make;
        this.severity = severity;
        this.source = source;
        this.recommendedAction = recommendedAction;
        this.estimatedImpact = estimatedImpact;
        this.status = status;
        this.data = data;
    }

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
