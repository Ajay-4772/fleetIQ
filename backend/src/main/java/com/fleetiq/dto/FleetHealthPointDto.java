package com.fleetiq.dto;

import java.time.Instant;

public class FleetHealthPointDto {
    private Instant timestamp;
    private String label;
    private double healthScore;
    private long vehicleCount;
    private long signalCount;

    public FleetHealthPointDto() {}

    public FleetHealthPointDto(Instant timestamp, String label, double healthScore, long vehicleCount, long signalCount) {
        this.timestamp = timestamp;
        this.label = label;
        this.healthScore = healthScore;
        this.vehicleCount = vehicleCount;
        this.signalCount = signalCount;
    }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public double getHealthScore() { return healthScore; }
    public void setHealthScore(double healthScore) { this.healthScore = healthScore; }

    public long getVehicleCount() { return vehicleCount; }
    public void setVehicleCount(long vehicleCount) { this.vehicleCount = vehicleCount; }

    public long getSignalCount() { return signalCount; }
    public void setSignalCount(long signalCount) { this.signalCount = signalCount; }
}
