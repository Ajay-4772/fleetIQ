package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebhookDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(WebhookDataSourceConnector.class);
    private final Map<String, Boolean> activeWebhooks = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "WEBHOOK";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        return true; // Webhooks receive incoming HTTP push
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        return Map.of(
                "endpointTemplate", "/api/v1/ingestion/webhooks/{sourceId}",
                "supportedAuth", "HMAC-SHA256 (Header: X-Vehyron-Signature) or Bearer/API Key",
                "samplePayload", Map.of(
                        "vehicle_id", "VH-1001",
                        "event_type", "BATTERY_WARNING",
                        "battery_voltage", 11.2,
                        "oil_life", 4,
                        "tire_pressure", 28.0,
                        "timestamp", Instant.now().toString()
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Activating webhook listener for source: {}", sourceId);
        activeWebhooks.put(sourceId, true);
    }

    @Override
    public void stop(String sourceId) {
        log.info("Deactivating webhook listener for source: {}", sourceId);
        activeWebhooks.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "WEBHOOK",
                "endpoint", "/api/v1/ingestion/webhooks/" + sourceId,
                "freshness", running ? "WEBHOOK" : "OFFLINE"
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activeWebhooks.getOrDefault(sourceId, true);
    }
}
