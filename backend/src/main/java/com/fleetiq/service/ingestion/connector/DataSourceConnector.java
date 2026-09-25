package com.fleetiq.service.ingestion.connector;

import java.util.Map;

/**
 * Common lifecycle abstraction for external enterprise vehicle telemetry connectors.
 * Connects VEHYRON to enterprise message brokers, IoT gateways, external APIs, and streams.
 */
public interface DataSourceConnector {
    String getType();
    boolean testConnection(Map<String, Object> configuration);
    Map<String, Object> inspectSchema(Map<String, Object> configuration);
    void start(String sourceId, Map<String, Object> configuration);
    void stop(String sourceId);
    Map<String, Object> getHealth(String sourceId);
    boolean isRunning(String sourceId);
}
