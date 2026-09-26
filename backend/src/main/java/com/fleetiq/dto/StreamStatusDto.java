package com.fleetiq.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class StreamStatusDto {
    private String pipelineStatus; // LIVE, CONNECTED_WAITING, NO_SOURCE_CONNECTED, STALE, ERROR
    private String statusLabel; // e.g. "Live", "Connected / Waiting", "No Source Connected"
    private int totalSources;
    private int activeSources;
    private Instant lastEventAt;
    private String freshnessDescription; // e.g. "Last event: 2 sec ago" or "No events received"
    private List<Map<String, Object>> configuredSources = new ArrayList<>();

    public StreamStatusDto() {}

    public StreamStatusDto(String pipelineStatus, String statusLabel, int totalSources, int activeSources,
                           Instant lastEventAt, String freshnessDescription, List<Map<String, Object>> configuredSources) {
        this.pipelineStatus = pipelineStatus;
        this.statusLabel = statusLabel;
        this.totalSources = totalSources;
        this.activeSources = activeSources;
        this.lastEventAt = lastEventAt;
        this.freshnessDescription = freshnessDescription;
        this.configuredSources = configuredSources != null ? configuredSources : new ArrayList<>();
    }

    public String getPipelineStatus() { return pipelineStatus; }
    public void setPipelineStatus(String pipelineStatus) { this.pipelineStatus = pipelineStatus; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public int getTotalSources() { return totalSources; }
    public void setTotalSources(int totalSources) { this.totalSources = totalSources; }

    public int getActiveSources() { return activeSources; }
    public void setActiveSources(int activeSources) { this.activeSources = activeSources; }

    public Instant getLastEventAt() { return lastEventAt; }
    public void setLastEventAt(Instant lastEventAt) { this.lastEventAt = lastEventAt; }

    public String getFreshnessDescription() { return freshnessDescription; }
    public void setFreshnessDescription(String freshnessDescription) { this.freshnessDescription = freshnessDescription; }

    public List<Map<String, Object>> getConfiguredSources() { return configuredSources; }
    public void setConfiguredSources(List<Map<String, Object>> configuredSources) { this.configuredSources = configuredSources; }
}
