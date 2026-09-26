package com.fleetiq.dto;

public class DashboardSummaryDto {
    private boolean hasData;
    private long totalVehicles;
    private long activeVehicles;
    private long inactiveVehicles;
    private long maintenanceVehicles;
    private long healthyVehicles;
    private long atRiskVehicles;
    private long criticalVehicles;
    private double fleetHealthScore; // 0 - 100%
    private double overallUtilizationPct;
    private long openActionCount;
    private long criticalActionCount;
    private double estimatedTotalImpact;

    public DashboardSummaryDto() {}

    public DashboardSummaryDto(boolean hasData, long totalVehicles, long activeVehicles, long inactiveVehicles,
                               long maintenanceVehicles, long healthyVehicles, long atRiskVehicles,
                               long criticalVehicles, double fleetHealthScore, double overallUtilizationPct,
                               long openActionCount, long criticalActionCount, double estimatedTotalImpact) {
        this.hasData = hasData;
        this.totalVehicles = totalVehicles;
        this.activeVehicles = activeVehicles;
        this.inactiveVehicles = inactiveVehicles;
        this.maintenanceVehicles = maintenanceVehicles;
        this.healthyVehicles = healthyVehicles;
        this.atRiskVehicles = atRiskVehicles;
        this.criticalVehicles = criticalVehicles;
        this.fleetHealthScore = fleetHealthScore;
        this.overallUtilizationPct = overallUtilizationPct;
        this.openActionCount = openActionCount;
        this.criticalActionCount = criticalActionCount;
        this.estimatedTotalImpact = estimatedTotalImpact;
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }

    public long getActiveVehicles() { return activeVehicles; }
    public void setActiveVehicles(long activeVehicles) { this.activeVehicles = activeVehicles; }

    public long getInactiveVehicles() { return inactiveVehicles; }
    public void setInactiveVehicles(long inactiveVehicles) { this.inactiveVehicles = inactiveVehicles; }

    public long getMaintenanceVehicles() { return maintenanceVehicles; }
    public void setMaintenanceVehicles(long maintenanceVehicles) { this.maintenanceVehicles = maintenanceVehicles; }

    public long getHealthyVehicles() { return healthyVehicles; }
    public void setHealthyVehicles(long healthyVehicles) { this.healthyVehicles = healthyVehicles; }

    public long getAtRiskVehicles() { return atRiskVehicles; }
    public void setAtRiskVehicles(long atRiskVehicles) { this.atRiskVehicles = atRiskVehicles; }

    public long getCriticalVehicles() { return criticalVehicles; }
    public void setCriticalVehicles(long criticalVehicles) { this.criticalVehicles = criticalVehicles; }

    public double getFleetHealthScore() { return fleetHealthScore; }
    public void setFleetHealthScore(double fleetHealthScore) { this.fleetHealthScore = fleetHealthScore; }

    public double getOverallUtilizationPct() { return overallUtilizationPct; }
    public void setOverallUtilizationPct(double overallUtilizationPct) { this.overallUtilizationPct = overallUtilizationPct; }

    public long getOpenActionCount() { return openActionCount; }
    public void setOpenActionCount(long openActionCount) { this.openActionCount = openActionCount; }

    public long getCriticalActionCount() { return criticalActionCount; }
    public void setCriticalActionCount(long criticalActionCount) { this.criticalActionCount = criticalActionCount; }

    public double getEstimatedTotalImpact() { return estimatedTotalImpact; }
    public void setEstimatedTotalImpact(double estimatedTotalImpact) { this.estimatedTotalImpact = estimatedTotalImpact; }
}
