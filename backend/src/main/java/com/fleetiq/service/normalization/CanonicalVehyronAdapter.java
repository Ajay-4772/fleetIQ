package com.fleetiq.service.normalization;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
@Order(100) // Evaluated after specific OEM adapters
public class CanonicalVehyronAdapter implements OemAdapter {

    @Override
    public boolean supports(String source, Map<String, Object> payload) {
        if (payload == null) return false;
        return payload.containsKey("vehicleId") ||
                payload.containsKey("vehicle_id") ||
                payload.containsKey("unit_id") ||
                payload.containsKey("asset_id") ||
                payload.containsKey("vehicleIdentifier");
    }

    @Override
    public CanonicalVehicleEvent normalize(String source, Map<String, Object> payload, String rawPayload) {
        String vehicleId = extractString(payload, "vehicleId", "vehicle_id", "unit_id", "asset_id", "vehicleIdentifier");
        if (vehicleId == null || vehicleId.isBlank()) {
            throw new IllegalArgumentException("Payload missing valid vehicle identifier (vehicleId, vehicle_id, unit_id)");
        }

        Double battery = extractDouble(payload, "battery_health_pct", "battery_voltage", "battery", "batteryHealthPct", "battery_v");
        Double oilLife = extractDouble(payload, "oil_life_pct", "oil_life", "oilLifePct", "oil_percent");
        Double tirePressure = extractDouble(payload, "tire_pressure_psi", "tire_pressure", "tirePressurePsi", "psi");
        Long odometer = extractLong(payload, "odometer_km", "odometer", "odometerKm", "mileage", "mileageKm");
        String faultCode = extractString(payload, "fault_code", "faultCode", "dtc", "diagnostic_code", "fault");
        Integer idleMinutes = extractInteger(payload, "idle_minutes", "idleMinutes", "idlingTimeMinutes");

        // Validate physical ranges & reject physically impossible values
        if (oilLife != null && (oilLife < 0 || oilLife > 100)) {
            throw new IllegalArgumentException("Invalid oil life metric: " + oilLife + "%. Must be between 0% and 100%.");
        }
        if (battery != null && (battery < 0 || battery > 1000)) {
            throw new IllegalArgumentException("Physically impossible battery reading: " + battery + ". Must be between 0 and 1000.");
        }
        if (tirePressure != null && (tirePressure < 0 || tirePressure > 150)) {
            throw new IllegalArgumentException("Physically impossible tire pressure: " + tirePressure + " PSI. Must be between 0 and 150 PSI.");
        }
        if (odometer != null && odometer < 0) {
            throw new IllegalArgumentException("Odometer reading cannot be negative: " + odometer + " km.");
        }

        // Determine event type and severity
        String eventType = "TELEMETRY_NORMAL";
        String severity = "LOW";

        if (faultCode != null && !faultCode.isBlank()) {
            eventType = "ENGINE_FAULT";
            severity = "CRITICAL";
        } else if (battery != null && (battery < 11.8 || (battery > 15 && battery < 80))) {
            eventType = "BATTERY_WARNING";
            severity = "HIGH";
        } else if (oilLife != null && oilLife < 10) {
            eventType = "MAINTENANCE_DUE";
            severity = "HIGH";
        } else if (tirePressure != null && tirePressure < 28.0) {
            eventType = "TIRE_PRESSURE_LOW";
            severity = "HIGH";
        } else if (idleMinutes != null && idleMinutes > 60) {
            eventType = "EXCESSIVE_IDLE";
            severity = "MEDIUM";
        }

        String eventId = "EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant eventTime = Instant.now();
        String tsStr = extractString(payload, "timestamp", "event_timestamp", "date_time", "time");
        if (tsStr != null && !tsStr.isBlank()) {
            try {
                eventTime = Instant.parse(tsStr);
            } catch (Exception ignored) {}
        }

        return new CanonicalVehicleEvent(
                eventId,
                vehicleId,
                eventType,
                severity,
                faultCode,
                idleMinutes,
                oilLife,
                battery,
                tirePressure,
                null,
                null,
                odometer,
                source != null ? source : "VEHYRON_INGESTION_GATEWAY",
                "NORMALIZED",
                rawPayload,
                eventTime
        );
    }

    private String extractString(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                String val = map.get(k).toString().trim();
                if (!val.isBlank() && !"null".equalsIgnoreCase(val)) return val;
            }
        }
        return null;
    }

    private Double extractDouble(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                try {
                    return Double.parseDouble(map.get(k).toString().trim());
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private Long extractLong(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                try {
                    return Double.valueOf(map.get(k).toString().trim()).longValue();
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private Integer extractInteger(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) {
                try {
                    return Double.valueOf(map.get(k).toString().trim()).intValue();
                } catch (Exception ignored) {}
            }
        }
        return null;
    }
}
