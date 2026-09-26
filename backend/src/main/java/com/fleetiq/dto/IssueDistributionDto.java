package com.fleetiq.dto;

import java.util.HashMap;
import java.util.Map;

public class IssueDistributionDto {
    private boolean hasData;
    private long totalIssues;
    private Map<String, Long> severityCounts = new HashMap<>(); // CRITICAL, HIGH, MEDIUM, LOW
    private Map<String, Long> categoryCounts = new HashMap<>(); // BATTERY, ENGINE, MAINTENANCE, TPMS, UTILIZATION, OTHER

    public IssueDistributionDto() {}

    public IssueDistributionDto(boolean hasData, long totalIssues,
                                Map<String, Long> severityCounts,
                                Map<String, Long> categoryCounts) {
        this.hasData = hasData;
        this.totalIssues = totalIssues;
        this.severityCounts = severityCounts != null ? severityCounts : new HashMap<>();
        this.categoryCounts = categoryCounts != null ? categoryCounts : new HashMap<>();
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public long getTotalIssues() { return totalIssues; }
    public void setTotalIssues(long totalIssues) { this.totalIssues = totalIssues; }

    public Map<String, Long> getSeverityCounts() { return severityCounts; }
    public void setSeverityCounts(Map<String, Long> severityCounts) { this.severityCounts = severityCounts; }

    public Map<String, Long> getCategoryCounts() { return categoryCounts; }
    public void setCategoryCounts(Map<String, Long> categoryCounts) { this.categoryCounts = categoryCounts; }
}
