package com.fleetiq.dto;

public class SimulatorScenarioResponse {
    private String scenario;
    private int eventsGenerated;
    private int normalizedCount;
    private int failedCount;
    private int decisionsCreated;
    private int actionsCreated;
    private long executionTimeMs;
    private String message;

    public SimulatorScenarioResponse() {}

    public SimulatorScenarioResponse(String scenario, int eventsGenerated, int normalizedCount,
                                     int failedCount, int decisionsCreated, int actionsCreated,
                                     long executionTimeMs, String message) {
        this.scenario = scenario;
        this.eventsGenerated = eventsGenerated;
        this.normalizedCount = normalizedCount;
        this.failedCount = failedCount;
        this.decisionsCreated = decisionsCreated;
        this.actionsCreated = actionsCreated;
        this.executionTimeMs = executionTimeMs;
        this.message = message;
    }

    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }

    public int getEventsGenerated() { return eventsGenerated; }
    public void setEventsGenerated(int eventsGenerated) { this.eventsGenerated = eventsGenerated; }

    public int getNormalizedCount() { return normalizedCount; }
    public void setNormalizedCount(int normalizedCount) { this.normalizedCount = normalizedCount; }

    public int getFailedCount() { return failedCount; }
    public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

    public int getDecisionsCreated() { return decisionsCreated; }
    public void setDecisionsCreated(int decisionsCreated) { this.decisionsCreated = decisionsCreated; }

    public int getActionsCreated() { return actionsCreated; }
    public void setActionsCreated(int actionsCreated) { this.actionsCreated = actionsCreated; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
