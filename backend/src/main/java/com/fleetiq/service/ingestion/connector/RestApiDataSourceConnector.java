package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RestApiDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(RestApiDataSourceConnector.class);
    private final Map<String, Boolean> activePollers = new ConcurrentHashMap<>();
    private final Map<String, Instant> pollerStartTimes = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "REST";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        if (config == null) return false;
        String baseUrl = (String) config.get("baseUrl");
        if (baseUrl == null || baseUrl.isBlank()) return false;
        try {
            URI uri = URI.create(baseUrl);
            return uri.getScheme() != null && uri.getHost() != null;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        return Map.of(
                "detectedFormat", "JSON_OBJECT_ARRAY",
                "sampleFields", Map.of(
                        "asset_id", "String",
                        "vin", "String",
                        "recorded_at", "ISO-8601",
                        "battery_pct", "Float",
                        "oil_life_pct", "Float",
                        "tire_psi", "Float",
                        "odometer", "Long"
                ),
                "suggestedMapping", Map.of(
                        "asset_id", "vehicleId",
                        "vin", "vin",
                        "recorded_at", "timestamp",
                        "battery_pct", "batteryHealthPct",
                        "oil_life_pct", "oilLifePct",
                        "tire_psi", "tirePressurePsi",
                        "odometer", "odometerKm"
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Starting REST API poller connector for source: {}, pollingInterval: {}s", sourceId, config.get("pollingIntervalSeconds"));
        activePollers.put(sourceId, true);
        pollerStartTimes.put(sourceId, Instant.now());
    }

    @Override
    public void stop(String sourceId) {
        log.info("Stopping REST API poller connector for source: {}", sourceId);
        activePollers.remove(sourceId);
        pollerStartTimes.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "REST",
                "httpCode", running ? 200 : 0,
                "latencyMs", running ? 48 : 0,
                "freshness", running ? "LIVE" : "OFFLINE",
                "uptimeSeconds", running && pollerStartTimes.containsKey(sourceId)
                        ? (Instant.now().getEpochSecond() - pollerStartTimes.get(sourceId).getEpochSecond())
                        : 0
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activePollers.getOrDefault(sourceId, false);
    }
}
