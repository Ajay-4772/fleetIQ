package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AzureEventHubsDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(AzureEventHubsDataSourceConnector.class);
    private final Map<String, Boolean> activeHubs = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "EVENT_HUBS";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        if (config == null) return false;
        String namespace = (String) config.get("namespace");
        String eventHubName = (String) config.get("eventHubName");
        return namespace != null && !namespace.isBlank() && eventHubName != null && !eventHubName.isBlank();
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        return Map.of(
                "platform", "Azure Event Hubs",
                "detectedFormat", "JSON_EVENT_DATA",
                "suggestedMapping", Map.of(
                        "Properties.vehicleId", "vehicleId",
                        "Properties.vin", "vin",
                        "EnqueuedTime", "timestamp"
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Starting Azure Event Hubs processor: {}", sourceId);
        activeHubs.put(sourceId, true);
    }

    @Override
    public void stop(String sourceId) {
        log.info("Stopping Azure Event Hubs processor: {}", sourceId);
        activeHubs.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "EVENT_HUBS",
                "freshness", running ? "STREAM" : "OFFLINE"
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activeHubs.getOrDefault(sourceId, false);
    }
}
