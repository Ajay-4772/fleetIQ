package com.fleetiq.service.normalization;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class BmwAdapter implements OemAdapter {

    @Override
    public boolean supports(String source, Map<String, Object> payload) {
        if ("SIMULATED_BMW".equalsIgnoreCase(source)) {
            return true;
        }
        return payload.containsKey("vehicleIdentifier") && (payload.containsKey("oil_life_remaining") || payload.containsKey("idlingTimeMinutes") || payload.containsKey("dtc"));
    }

    @Override
    public CanonicalVehicleEvent normalize(String source, Map<String, Object> payload, String rawPayload) {
        Object vIdObj = payload.get("vehicleIdentifier");
        if (vIdObj == null || vIdObj.toString().trim().isEmpty()) {
            throw new IllegalArgumentException("BMW payload missing valid vehicleIdentifier");
        }
        String vehicleId = vIdObj.toString().trim();

        Double oilLife = getDouble(payload.get("oil_life_remaining"));
        if (oilLife != null && (oilLife < 0 || oilLife > 100)) {
            throw new IllegalArgumentException("BMW payload oil_life_remaining out of valid range 0-100: " + oilLife);
        }

        Integer idleMinutes = getInteger(payload.get("idlingTimeMinutes"));
        if (idleMinutes != null && idleMinutes < 0) {
            throw new IllegalArgumentException("BMW payload idlingTimeMinutes cannot be negative: " + idleMinutes);
        }

        String fault = payload.get("dtc") != null ? payload.get("dtc").toString().trim() : null;
        if (fault != null && (fault.isEmpty() || "null".equalsIgnoreCase(fault))) {
            fault = null;
        }

        Double batteryPct = getDouble(payload.get("batteryHealth"));
        Long odometer = getLong(payload.get("totalDistanceKm"));

        Instant ts = parseTimestamp(payload.get("timestamp"));
        String eventId = "EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return new CanonicalVehicleEvent(
                eventId,
                vehicleId,
                "TELEMETRY_RAW",
                "LOW",
                fault,
                idleMinutes,
                oilLife,
                batteryPct,
                32.0,
                idleMinutes != null ? idleMinutes * 0.05 : 0.0,
                idleMinutes != null ? idleMinutes / 60.0 : 0.0,
                odometer,
                "SIMULATED_BMW",
                "NORMALIZED",
                rawPayload,
                ts
        );
    }

    private Double getDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid numeric value: " + val);
        }
    }

    private Integer getInteger(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            return Integer.parseInt(val.toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer value: " + val);
        }
    }

    private Long getLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        try {
            return Long.parseLong(val.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Instant parseTimestamp(Object val) {
        if (val == null) return Instant.now();
        try {
            return Instant.parse(val.toString());
        } catch (Exception e) {
            return Instant.now();
        }
    }
}
