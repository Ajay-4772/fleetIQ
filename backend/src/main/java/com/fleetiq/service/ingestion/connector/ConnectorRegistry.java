package com.fleetiq.service.ingestion.connector;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectorRegistry {

    private final Map<String, DataSourceConnector> connectors = new ConcurrentHashMap<>();

    public ConnectorRegistry(List<DataSourceConnector> connectorList) {
        for (DataSourceConnector connector : connectorList) {
            connectors.put(connector.getType().toUpperCase(), connector);
        }
    }

    public Optional<DataSourceConnector> getConnector(String type) {
        if (type == null) return Optional.empty();
        return Optional.ofNullable(connectors.get(type.trim().toUpperCase()));
    }

    public List<String> getSupportedTypes() {
        return List.copyOf(connectors.keySet());
    }
}
