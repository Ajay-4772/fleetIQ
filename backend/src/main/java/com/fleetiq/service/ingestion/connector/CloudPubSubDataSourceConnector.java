package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CloudPubSubDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(CloudPubSubDataSourceConnector.class);
    private final Map<String, Boolean> activeSubscriptions = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "PUBSUB";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        if (config == null) return false;
        String projectId = (String) config.get("projectId");
        String subscriptionId = (String) config.get("subscriptionId");
        return projectId != null && !projectId.isBlank() && subscriptionId != null && !subscriptionId.isBlank();
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        return Map.of(
                "platform", "Google Cloud Pub/Sub",
                "detectedFormat", "JSON_PUBSUB_MESSAGE",
                "suggestedMapping", Map.of(
                        "data.vehicleId", "vehicleId",
                        "data.vin", "vin",
                        "publishTime", "timestamp"
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Starting Google Cloud Pub/Sub subscriber: {}", sourceId);
        activeSubscriptions.put(sourceId, true);
    }

    @Override
    public void stop(String sourceId) {
        log.info("Stopping Google Cloud Pub/Sub subscriber: {}", sourceId);
        activeSubscriptions.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "PUBSUB",
                "freshness", running ? "STREAM" : "OFFLINE"
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activeSubscriptions.getOrDefault(sourceId, false);
    }
}
