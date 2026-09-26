package com.fleetiq.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class IngestionThroughputDto {
    private boolean hasData;
    private long eventsReceived;
    private long eventsProcessed;
    private long eventsRejected;
    private double processingRate; // events per minute
    private double processingLatencyMs;
    private String freshnessStatus; // LIVE, STALE, NO_DATA, OFFLINE
    private Instant lastEventTimestamp;
    private List<ThroughputPointDto> points = new ArrayList<>();

    public IngestionThroughputDto() {}

    public IngestionThroughputDto(boolean hasData, long eventsReceived, long eventsProcessed, long eventsRejected,
                                  double processingRate, double processingLatencyMs, String freshnessStatus,
                                  Instant lastEventTimestamp, List<ThroughputPointDto> points) {
        this.hasData = hasData;
        this.eventsReceived = eventsReceived;
        this.eventsProcessed = eventsProcessed;
        this.eventsRejected = eventsRejected;
        this.processingRate = processingRate;
        this.processingLatencyMs = processingLatencyMs;
        this.freshnessStatus = freshnessStatus;
        this.lastEventTimestamp = lastEventTimestamp;
        this.points = points != null ? points : new ArrayList<>();
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public long getEventsReceived() { return eventsReceived; }
    public void setEventsReceived(long eventsReceived) { this.eventsReceived = eventsReceived; }

    public long getEventsProcessed() { return eventsProcessed; }
    public void setEventsProcessed(long eventsProcessed) { this.eventsProcessed = eventsProcessed; }

    public long getEventsRejected() { return eventsRejected; }
    public void setEventsRejected(long eventsRejected) { this.eventsRejected = eventsRejected; }

    public double getProcessingRate() { return processingRate; }
    public void setProcessingRate(double processingRate) { this.processingRate = processingRate; }

    public double getProcessingLatencyMs() { return processingLatencyMs; }
    public void setProcessingLatencyMs(double processingLatencyMs) { this.processingLatencyMs = processingLatencyMs; }

    public String getFreshnessStatus() { return freshnessStatus; }
    public void setFreshnessStatus(String freshnessStatus) { this.freshnessStatus = freshnessStatus; }

    public Instant getLastEventTimestamp() { return lastEventTimestamp; }
    public void setLastEventTimestamp(Instant lastEventTimestamp) { this.lastEventTimestamp = lastEventTimestamp; }

    public List<ThroughputPointDto> getPoints() { return points; }
    public void setPoints(List<ThroughputPointDto> points) { this.points = points; }
}
