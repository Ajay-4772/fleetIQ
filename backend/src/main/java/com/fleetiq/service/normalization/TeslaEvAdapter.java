package com.fleetiq.service.normalization;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class TeslaEvAdapter implements OemAdapter {

    @Override
    public boolean supports(String source, Map<String, Object> payload) {
        if ("SIMULATED_TESLA".equalsIgnoreCase(source)) {
            return true;
        }
        return payload.containsKey("vin_id") || payload.containsKey("state_of_charge") || payload.containsKey("alert_code");
    }

    @Override
    public CanonicalVehicleEvent normalize(String source, Map<String, Object> payload, String rawPayload) {
        Object vIdObj = payload.get("vin_id");
        if (vIdObj == null) {
            vIdObj = payload.get("vehicle_id");
        }
        if (vIdObj == null || vIdObj.toString().trim().isEmpty()) {
            throw new IllegalArgumentException("Tesla EV payload missing valid vin_id/vehicle_id");
        }
        String vehicleId = vIdObj.toString().trim();

        Double soc = getDouble(payload.get("state_of_charge"));
        if (soc != null && (soc < 0 || soc > 100)) {
            throw new IllegalArgumentException("Tesla EV payload state_of_charge out of valid range 0-100: " + soc);
        }

        Integer idleMins = getInteger(payload.get("idle_mins"));
        if (idleMins == null && payload.get("idle_seconds") != null) {
            Integer secs = getInteger(payload.get("idle_seconds"));
            if (secs != null) idleMins = secs / 60;
        }
        if (idleMins != null && idleMins < 0) {
            throw new IllegalArgumentException("Tesla EV payload idle cannot be negative: " + idleMins);
        }

        String alert = payload.get("alert_code") != null ? payload.get("alert_code").toString().trim() : null;
        if (alert != null && (alert.isEmpty() || "null".equalsIgnoreCase(alert))) {
            alert = null;
        }

        Long odo = getLong(payload.get("odometer"));

        Instant ts = parseTimestamp(payload.get("timestamp"));
        String eventId = "EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return new CanonicalVehicleEvent(
                eventId,
                vehicleId,
                "TELEMETRY_RAW",
                "LOW",
                alert,
                idleMins,
                100.0, // EV has no engine oil
                soc,
                34.0,
                0.0, // Zero fuel burn
                idleMins != null ? idleMins / 60.0 : 0.0,
                odo,
                "SIMULATED_TESLA",
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
