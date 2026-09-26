package com.fleetiq.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class FleetHealthDto {
    private boolean hasData;
    private double healthyPercentage;
    private double atRiskPercentage;
    private double criticalPercentage;
    private long maintenanceDueCount;
    private long engineFaultCount;
    private long batteryWarningCount;
    private long tirePressureWarningCount;
    private long excessiveIdleCount;
    private long lowUtilizationCount;
    private Double previousPeriodPercentageChange;
    private List<FleetHealthPointDto> points = new ArrayList<>();
    private String freshnessStatus;
    private Instant lastEventTimestamp;

    public FleetHealthDto() {}

    public FleetHealthDto(boolean hasData, double healthyPercentage, double atRiskPercentage, double criticalPercentage,
                          long maintenanceDueCount, long engineFaultCount, long batteryWarningCount,
                          long tirePressureWarningCount, long excessiveIdleCount, long lowUtilizationCount,
                          Double previousPeriodPercentageChange, List<FleetHealthPointDto> points,
                          String freshnessStatus, Instant lastEventTimestamp) {
        this.hasData = hasData;
        this.healthyPercentage = healthyPercentage;
        this.atRiskPercentage = atRiskPercentage;
        this.criticalPercentage = criticalPercentage;
        this.maintenanceDueCount = maintenanceDueCount;
        this.engineFaultCount = engineFaultCount;
        this.batteryWarningCount = batteryWarningCount;
        this.tirePressureWarningCount = tirePressureWarningCount;
        this.excessiveIdleCount = excessiveIdleCount;
        this.lowUtilizationCount = lowUtilizationCount;
        this.previousPeriodPercentageChange = previousPeriodPercentageChange;
        this.points = points != null ? points : new ArrayList<>();
        this.freshnessStatus = freshnessStatus;
        this.lastEventTimestamp = lastEventTimestamp;
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public double getHealthyPercentage() { return healthyPercentage; }
    public void setHealthyPercentage(double healthyPercentage) { this.healthyPercentage = healthyPercentage; }

    public double getAtRiskPercentage() { return atRiskPercentage; }
    public void setAtRiskPercentage(double atRiskPercentage) { this.atRiskPercentage = atRiskPercentage; }

    public double getCriticalPercentage() { return criticalPercentage; }
    public void setCriticalPercentage(double criticalPercentage) { this.criticalPercentage = criticalPercentage; }

    public long getMaintenanceDueCount() { return maintenanceDueCount; }
    public void setMaintenanceDueCount(long maintenanceDueCount) { this.maintenanceDueCount = maintenanceDueCount; }

    public long getEngineFaultCount() { return engineFaultCount; }
    public void setEngineFaultCount(long engineFaultCount) { this.engineFaultCount = engineFaultCount; }

    public long getBatteryWarningCount() { return batteryWarningCount; }
    public void setBatteryWarningCount(long batteryWarningCount) { this.batteryWarningCount = batteryWarningCount; }

    public long getTirePressureWarningCount() { return tirePressureWarningCount; }
    public void setTirePressureWarningCount(long tirePressureWarningCount) { this.tirePressureWarningCount = tirePressureWarningCount; }

    public long getExcessiveIdleCount() { return excessiveIdleCount; }
    public void setExcessiveIdleCount(long excessiveIdleCount) { this.excessiveIdleCount = excessiveIdleCount; }

    public long getLowUtilizationCount() { return lowUtilizationCount; }
    public void setLowUtilizationCount(long lowUtilizationCount) { this.lowUtilizationCount = lowUtilizationCount; }

    public Double getPreviousPeriodPercentageChange() { return previousPeriodPercentageChange; }
    public void setPreviousPeriodPercentageChange(Double previousPeriodPercentageChange) { this.previousPeriodPercentageChange = previousPeriodPercentageChange; }

    public List<FleetHealthPointDto> getPoints() { return points; }
    public void setPoints(List<FleetHealthPointDto> points) { this.points = points; }

    public String getFreshnessStatus() { return freshnessStatus; }
    public void setFreshnessStatus(String freshnessStatus) { this.freshnessStatus = freshnessStatus; }

    public Instant getLastEventTimestamp() { return lastEventTimestamp; }
    public void setLastEventTimestamp(Instant lastEventTimestamp) { this.lastEventTimestamp = lastEventTimestamp; }
}
