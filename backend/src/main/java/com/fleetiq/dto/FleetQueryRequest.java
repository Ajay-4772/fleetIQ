package com.fleetiq.dto;

import java.util.Map;

public class FleetQueryRequest {
    private String intent;
    private Map<String, Object> parameters;

    public FleetQueryRequest() {}

    public FleetQueryRequest(String intent, Map<String, Object> parameters) {
        this.intent = intent;
        this.parameters = parameters;
    }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public Map<String, Object> getParameters() { return parameters; }
    public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
}
