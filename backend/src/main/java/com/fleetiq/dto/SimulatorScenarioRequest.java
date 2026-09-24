package com.fleetiq.dto;

public class SimulatorScenarioRequest {
    private String scenarioName;
    private Long seed;
    private Integer eventCount;
    private Double faultRate;
    private Double maintenanceRate;
    private Double idleRate;
    private Double lowUtilizationRate;

    public SimulatorScenarioRequest() {}

    public SimulatorScenarioRequest(String scenarioName, Long seed, Integer eventCount,
                                    Double faultRate, Double maintenanceRate, Double idleRate, Double lowUtilizationRate) {
        this.scenarioName = scenarioName;
        this.seed = seed;
        this.eventCount = eventCount;
        this.faultRate = faultRate;
        this.maintenanceRate = maintenanceRate;
        this.idleRate = idleRate;
        this.lowUtilizationRate = lowUtilizationRate;
    }

    public String getScenarioName() { return scenarioName; }
    public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }

    public Long getSeed() { return seed; }
    public void setSeed(Long seed) { this.seed = seed; }

    public Integer getEventCount() { return eventCount; }
    public void setEventCount(Integer eventCount) { this.eventCount = eventCount; }

    public Double getFaultRate() { return faultRate; }
    public void setFaultRate(Double faultRate) { this.faultRate = faultRate; }

    public Double getMaintenanceRate() { return maintenanceRate; }
    public void setMaintenanceRate(Double maintenanceRate) { this.maintenanceRate = maintenanceRate; }

    public Double getIdleRate() { return idleRate; }
    public void setIdleRate(Double idleRate) { this.idleRate = idleRate; }

    public Double getLowUtilizationRate() { return lowUtilizationRate; }
    public void setLowUtilizationRate(Double lowUtilizationRate) { this.lowUtilizationRate = lowUtilizationRate; }
}
