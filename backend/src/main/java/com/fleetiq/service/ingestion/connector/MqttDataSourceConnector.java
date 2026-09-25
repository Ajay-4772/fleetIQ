package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MqttDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(MqttDataSourceConnector.class);
    private final Map<String, Boolean> activeStreams = new ConcurrentHashMap<>();
    private final Map<String, Instant> streamStartTimes = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "MQTT";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        if (config == null) return false;
        String brokerUrl = (String) config.get("brokerUrl");
        return brokerUrl != null && !brokerUrl.isBlank();
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        String topic = (String) config.getOrDefault("topicFilter", "vehicles/+/telemetry");
        return Map.of(
                "topicFilter", topic,
                "detectedFormat", "JSON",
                "sampleFields", Map.of(
                        "unit_id", "String",
                        "vin", "String",
                        "event_time", "ISO-8601",
                        "soc", "Float",
                        "oil_pct", "Float",
                        "tire_psi", "Float",
                        "distance", "Long"
                ),
                "suggestedMapping", Map.of(
                        "unit_id", "vehicleId",
                        "vin", "vin",
                        "event_time", "timestamp",
                        "soc", "batteryHealthPct",
                        "oil_pct", "oilLifePct",
                        "tire_psi", "tirePressurePsi",
                        "distance", "odometerKm"
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Starting MQTT IoT subscriber connector for source: {}, topic: {}", sourceId, config.get("topicFilter"));
        activeStreams.put(sourceId, true);
        streamStartTimes.put(sourceId, Instant.now());
    }

    @Override
    public void stop(String sourceId) {
        log.info("Stopping MQTT subscriber connector for source: {}", sourceId);
        activeStreams.remove(sourceId);
        streamStartTimes.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "MQTT",
                "qos", 1,
                "eventsPerSec", running ? 18.2 : 0.0,
                "freshness", running ? "LIVE" : "OFFLINE",
                "uptimeSeconds", running && streamStartTimes.containsKey(sourceId)
                        ? (Instant.now().getEpochSecond() - streamStartTimes.get(sourceId).getEpochSecond())
                        : 0
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activeStreams.getOrDefault(sourceId, false);
    }
}
