package com.fleetiq.dto;

import java.util.List;
import java.util.Map;

public class FleetQueryResponse {
    private String intent;
    private String summary;
    private int resultCount;
    private List<?> data;
    private Map<String, Object> metadata;

    public FleetQueryResponse() {}

    public FleetQueryResponse(String intent, String summary, int resultCount, List<?> data, Map<String, Object> metadata) {
        this.intent = intent;
        this.summary = summary;
        this.resultCount = resultCount;
        this.data = data;
        this.metadata = metadata;
    }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public int getResultCount() { return resultCount; }
    public void setResultCount(int resultCount) { this.resultCount = resultCount; }

    public List<?> getData() { return data; }
    public void setData(List<?> data) { this.data = data; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
