package com.fleetiq.dto;

public class TrendDataPointDto {
    private String timestamp;
    private long eventsCount;
    private long criticalCount;
    private long maintenanceCount;
    private long faultCount;
    private double estimatedImpact;

    public TrendDataPointDto() {}

    public TrendDataPointDto(String timestamp, long eventsCount, long criticalCount,
                             long maintenanceCount, long faultCount, double estimatedImpact) {
        this.timestamp = timestamp;
        this.eventsCount = eventsCount;
        this.criticalCount = criticalCount;
        this.maintenanceCount = maintenanceCount;
        this.faultCount = faultCount;
        this.estimatedImpact = estimatedImpact;
    }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public long getEventsCount() { return eventsCount; }
    public void setEventsCount(long eventsCount) { this.eventsCount = eventsCount; }

    public long getCriticalCount() { return criticalCount; }
    public void setCriticalCount(long criticalCount) { this.criticalCount = criticalCount; }

    public long getMaintenanceCount() { return maintenanceCount; }
    public void setMaintenanceCount(long maintenanceCount) { this.maintenanceCount = maintenanceCount; }

    public long getFaultCount() { return faultCount; }
    public void setFaultCount(long faultCount) { this.faultCount = faultCount; }

    public double getEstimatedImpact() { return estimatedImpact; }
    public void setEstimatedImpact(double estimatedImpact) { this.estimatedImpact = estimatedImpact; }
}
