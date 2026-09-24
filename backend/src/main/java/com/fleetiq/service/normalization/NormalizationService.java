package com.fleetiq.service.normalization;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class NormalizationService {

    private final List<OemAdapter> adapters;
    private final ObjectMapper objectMapper;

    public NormalizationService(List<OemAdapter> adapters, ObjectMapper objectMapper) {
        this.adapters = adapters;
        this.objectMapper = objectMapper;
    }

    public CanonicalVehicleEvent normalize(String source, Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            throw new IllegalArgumentException("Payload cannot be null or empty");
        }

        String rawJson;
        try {
            rawJson = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            rawJson = payload.toString();
        }

        for (OemAdapter adapter : adapters) {
            if (adapter.supports(source, payload)) {
                return adapter.normalize(source, payload, rawJson);
            }
        }

        throw new IllegalArgumentException("Unsupported OEM telemetry source or unrecognizable payload format: " + source);
    }

    public CanonicalVehicleEvent normalizeJson(String source, String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            throw new IllegalArgumentException("JSON payload string cannot be null or empty");
        }
        try {
            Map<String, Object> map = objectMapper.readValue(jsonString, new TypeReference<Map<String, Object>>() {});
            return normalize(source, map);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Malformed JSON payload: " + e.getMessage(), e);
        }
    }
}
