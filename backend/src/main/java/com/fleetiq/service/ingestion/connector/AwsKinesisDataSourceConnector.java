package com.fleetiq.service.ingestion.connector;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AwsKinesisDataSourceConnector implements DataSourceConnector {

    private static final Logger log = LoggerFactory.getLogger(AwsKinesisDataSourceConnector.class);
    private final Map<String, Boolean> activeStreams = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "KINESIS";
    }

    @Override
    public boolean testConnection(Map<String, Object> config) {
        if (config == null) return false;
        String region = (String) config.get("region");
        String streamName = (String) config.get("streamName");
        return region != null && !region.isBlank() && streamName != null && !streamName.isBlank();
    }

    @Override
    public Map<String, Object> inspectSchema(Map<String, Object> config) {
        return Map.of(
                "platform", "AWS Kinesis Data Streams",
                "detectedFormat", "JSON_KINESIS_RECORD",
                "suggestedMapping", Map.of(
                        "PartitionKey", "vehicleId",
                        "Data.vin", "vin",
                        "ApproximateArrivalTimestamp", "timestamp"
                )
        );
    }

    @Override
    public void start(String sourceId, Map<String, Object> config) {
        log.info("Starting AWS Kinesis stream consumer: {}", sourceId);
        activeStreams.put(sourceId, true);
    }

    @Override
    public void stop(String sourceId) {
        log.info("Stopping AWS Kinesis stream consumer: {}", sourceId);
        activeStreams.remove(sourceId);
    }

    @Override
    public Map<String, Object> getHealth(String sourceId) {
        boolean running = isRunning(sourceId);
        return Map.of(
                "status", running ? "CONNECTED" : "DISCONNECTED",
                "type", "KINESIS",
                "freshness", running ? "STREAM" : "OFFLINE"
        );
    }

    @Override
    public boolean isRunning(String sourceId) {
        return activeStreams.getOrDefault(sourceId, false);
    }
}
