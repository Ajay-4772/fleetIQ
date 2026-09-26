package com.fleetiq.dto;

public class SafetyScoreDto {
    private boolean hasData;
    private Double safetyScore;
    private double targetScore = 95.0;
    private String status; // NOMINAL, AT_RISK, CRITICAL, UNAVAILABLE
    private long harshBrakingCount;
    private long speedViolationsCount;
    private long criticalFaultCount;
    private double complianceRate;

    public SafetyScoreDto() {}

    public SafetyScoreDto(boolean hasData, Double safetyScore, double targetScore, String status,
                          long harshBrakingCount, long speedViolationsCount, long criticalFaultCount, double complianceRate) {
        this.hasData = hasData;
        this.safetyScore = safetyScore;
        this.targetScore = targetScore;
        this.status = status;
        this.harshBrakingCount = harshBrakingCount;
        this.speedViolationsCount = speedViolationsCount;
        this.criticalFaultCount = criticalFaultCount;
        this.complianceRate = complianceRate;
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public Double getSafetyScore() { return safetyScore; }
    public void setSafetyScore(Double safetyScore) { this.safetyScore = safetyScore; }

    public double getTargetScore() { return targetScore; }
    public void setTargetScore(double targetScore) { this.targetScore = targetScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getHarshBrakingCount() { return harshBrakingCount; }
    public void setHarshBrakingCount(long harshBrakingCount) { this.harshBrakingCount = harshBrakingCount; }

    public long getSpeedViolationsCount() { return speedViolationsCount; }
    public void setSpeedViolationsCount(long speedViolationsCount) { this.speedViolationsCount = speedViolationsCount; }

    public long getCriticalFaultCount() { return criticalFaultCount; }
    public void setCriticalFaultCount(long criticalFaultCount) { this.criticalFaultCount = criticalFaultCount; }

    public double getComplianceRate() { return complianceRate; }
    public void setComplianceRate(double complianceRate) { this.complianceRate = complianceRate; }
}
