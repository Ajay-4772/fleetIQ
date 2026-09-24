package com.fleetiq.dto;

public class FleetHealthDto {
    private double healthyPercentage;
    private double atRiskPercentage;
    private double criticalPercentage;
    private long maintenanceDueCount;
    private long engineFaultCount;
    private long batteryWarningCount;
    private long tirePressureWarningCount;
    private long excessiveIdleCount;
    private long lowUtilizationCount;

    public FleetHealthDto() {}

    public FleetHealthDto(double healthyPercentage, double atRiskPercentage, double criticalPercentage,
                          long maintenanceDueCount, long engineFaultCount, long batteryWarningCount,
                          long tirePressureWarningCount, long excessiveIdleCount, long lowUtilizationCount) {
        this.healthyPercentage = healthyPercentage;
        this.atRiskPercentage = atRiskPercentage;
        this.criticalPercentage = criticalPercentage;
        this.maintenanceDueCount = maintenanceDueCount;
        this.engineFaultCount = engineFaultCount;
        this.batteryWarningCount = batteryWarningCount;
        this.tirePressureWarningCount = tirePressureWarningCount;
        this.excessiveIdleCount = excessiveIdleCount;
        this.lowUtilizationCount = lowUtilizationCount;
    }

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
}
