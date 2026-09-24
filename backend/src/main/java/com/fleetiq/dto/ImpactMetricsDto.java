package com.fleetiq.dto;

public class ImpactMetricsDto {
    private double totalEstimatedImpact;
    private double openActionImpact;
    private double criticalActionImpact;
    private double maintenanceImpact;
    private double faultImpact;
    private double idleFuelImpact;
    private double batteryImpact;

    public ImpactMetricsDto() {}

    public ImpactMetricsDto(double totalEstimatedImpact, double openActionImpact, double criticalActionImpact,
                            double maintenanceImpact, double faultImpact, double idleFuelImpact, double batteryImpact) {
        this.totalEstimatedImpact = totalEstimatedImpact;
        this.openActionImpact = openActionImpact;
        this.criticalActionImpact = criticalActionImpact;
        this.maintenanceImpact = maintenanceImpact;
        this.faultImpact = faultImpact;
        this.idleFuelImpact = idleFuelImpact;
        this.batteryImpact = batteryImpact;
    }

    public double getTotalEstimatedImpact() { return totalEstimatedImpact; }
    public void setTotalEstimatedImpact(double totalEstimatedImpact) { this.totalEstimatedImpact = totalEstimatedImpact; }

    public double getOpenActionImpact() { return openActionImpact; }
    public void setOpenActionImpact(double openActionImpact) { this.openActionImpact = openActionImpact; }

    public double getCriticalActionImpact() { return criticalActionImpact; }
    public void setCriticalActionImpact(double criticalActionImpact) { this.criticalActionImpact = criticalActionImpact; }

    public double getMaintenanceImpact() { return maintenanceImpact; }
    public void setMaintenanceImpact(double maintenanceImpact) { this.maintenanceImpact = maintenanceImpact; }

    public double getFaultImpact() { return faultImpact; }
    public void setFaultImpact(double faultImpact) { this.faultImpact = faultImpact; }

    public double getIdleFuelImpact() { return idleFuelImpact; }
    public void setIdleFuelImpact(double idleFuelImpact) { this.idleFuelImpact = idleFuelImpact; }

    public double getBatteryImpact() { return batteryImpact; }
    public void setBatteryImpact(double batteryImpact) { this.batteryImpact = batteryImpact; }
}
