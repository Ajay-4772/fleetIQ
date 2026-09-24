package com.fleetiq.dto;

public class LoadTestResponse {
    private int eventLevel;
    private int eventsGenerated;
    private int successfullyNormalized;
    private int failedNormalization;
    private long totalProcessingTimeMs;
    private double avgLatencyMs;
    private double p95LatencyMs;
    private double p99LatencyMs;
    private int decisionsGenerated;
    private int fallbackDecisions;
    private int actionsCreated;

    public LoadTestResponse() {}

    public LoadTestResponse(int eventLevel, int eventsGenerated, int successfullyNormalized,
                            int failedNormalization, long totalProcessingTimeMs, double avgLatencyMs,
                            double p95LatencyMs, double p99LatencyMs, int decisionsGenerated,
                            int fallbackDecisions, int actionsCreated) {
        this.eventLevel = eventLevel;
        this.eventsGenerated = eventsGenerated;
        this.successfullyNormalized = successfullyNormalized;
        this.failedNormalization = failedNormalization;
        this.totalProcessingTimeMs = totalProcessingTimeMs;
        this.avgLatencyMs = avgLatencyMs;
        this.p95LatencyMs = p95LatencyMs;
        this.p99LatencyMs = p99LatencyMs;
        this.decisionsGenerated = decisionsGenerated;
        this.fallbackDecisions = fallbackDecisions;
        this.actionsCreated = actionsCreated;
    }

    public int getEventLevel() { return eventLevel; }
    public void setEventLevel(int eventLevel) { this.eventLevel = eventLevel; }

    public int getEventsGenerated() { return eventsGenerated; }
    public void setEventsGenerated(int eventsGenerated) { this.eventsGenerated = eventsGenerated; }

    public int getSuccessfullyNormalized() { return successfullyNormalized; }
    public void setSuccessfullyNormalized(int successfullyNormalized) { this.successfullyNormalized = successfullyNormalized; }

    public int getFailedNormalization() { return failedNormalization; }
    public void setFailedNormalization(int failedNormalization) { this.failedNormalization = failedNormalization; }

    public long getTotalProcessingTimeMs() { return totalProcessingTimeMs; }
    public void setTotalProcessingTimeMs(long totalProcessingTimeMs) { this.totalProcessingTimeMs = totalProcessingTimeMs; }

    public double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }

    public double getP95LatencyMs() { return p95LatencyMs; }
    public void setP95LatencyMs(double p95LatencyMs) { this.p95LatencyMs = p95LatencyMs; }

    public double getP99LatencyMs() { return p99LatencyMs; }
    public void setP99LatencyMs(double p99LatencyMs) { this.p99LatencyMs = p99LatencyMs; }

    public int getDecisionsGenerated() { return decisionsGenerated; }
    public void setDecisionsGenerated(int decisionsGenerated) { this.decisionsGenerated = decisionsGenerated; }

    public int getFallbackDecisions() { return fallbackDecisions; }
    public void setFallbackDecisions(int fallbackDecisions) { this.fallbackDecisions = fallbackDecisions; }

    public int getActionsCreated() { return actionsCreated; }
    public void setActionsCreated(int actionsCreated) { this.actionsCreated = actionsCreated; }
}
