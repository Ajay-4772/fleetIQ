package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "canonical_vehicle_events")
public class CanonicalVehicleEvent {

    @Id
    @Column(name = "event_id", length = 64)
    private String eventId;

    @Column(name = "vehicle_id", nullable = false, length = 32)
    private String vehicleId;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType; // ENGINE_FAULT, MAINTENANCE_DUE, EXCESSIVE_IDLE, BATTERY_WARNING, TIRE_PRESSURE_LOW, TELEMETRY_NORMAL

    @Column(name = "severity", length = 32)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "fault_code", length = 32)
    private String faultCode;

    @Column(name = "idle_minutes")
    private Integer idleMinutes;

    @Column(name = "oil_life_pct")
    private Double oilLifePct;

    @Column(name = "battery_health_pct")
    private Double batteryHealthPct;

    @Column(name = "tire_pressure_psi")
    private Double tirePressurePsi;

    @Column(name = "fuel_consumed_liters")
    private Double fuelConsumedLiters;

    @Column(name = "operating_hours")
    private Double operatingHours;

    @Column(name = "odometer_km")
    private Long odometerKm;

    @Column(name = "source", nullable = false, length = 64)
    private String source; // SIMULATED_TOYOTA, SIMULATED_FORD, SIMULATED_BMW, SIMULATED_TESLA

    @Column(name = "processing_status", length = 32)
    private String status; // NORMALIZED, PROCESSED, FAILED

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "event_timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "ingested_at")
    private Instant ingestedAt = Instant.now();

    public CanonicalVehicleEvent() {}

    public CanonicalVehicleEvent(String eventId, String vehicleId, String eventType, String severity,
                                 String faultCode, Integer idleMinutes, Double oilLifePct, Double batteryHealthPct,
                                 Double tirePressurePsi, Double fuelConsumedLiters, Double operatingHours,
                                 Long odometerKm, String source, String status, String rawPayload, Instant timestamp) {
        this.eventId = eventId;
        this.vehicleId = vehicleId;
        this.eventType = eventType;
        this.severity = severity;
        this.faultCode = faultCode;
        this.idleMinutes = idleMinutes;
        this.oilLifePct = oilLifePct;
        this.batteryHealthPct = batteryHealthPct;
        this.tirePressurePsi = tirePressurePsi;
        this.fuelConsumedLiters = fuelConsumedLiters;
        this.operatingHours = operatingHours;
        this.odometerKm = odometerKm;
        this.source = source;
        this.status = status;
        this.rawPayload = rawPayload;
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.ingestedAt = Instant.now();
    }

    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getFaultCode() { return faultCode; }
    public void setFaultCode(String faultCode) { this.faultCode = faultCode; }

    public Integer getIdleMinutes() { return idleMinutes; }
    public void setIdleMinutes(Integer idleMinutes) { this.idleMinutes = idleMinutes; }

    public Double getOilLifePct() { return oilLifePct; }
    public void setOilLifePct(Double oilLifePct) { this.oilLifePct = oilLifePct; }

    public Double getBatteryHealthPct() { return batteryHealthPct; }
    public void setBatteryHealthPct(Double batteryHealthPct) { this.batteryHealthPct = batteryHealthPct; }

    public Double getTirePressurePsi() { return tirePressurePsi; }
    public void setTirePressurePsi(Double tirePressurePsi) { this.tirePressurePsi = tirePressurePsi; }

    public Double getFuelConsumedLiters() { return fuelConsumedLiters; }
    public void setFuelConsumedLiters(Double fuelConsumedLiters) { this.fuelConsumedLiters = fuelConsumedLiters; }

    public Double getOperatingHours() { return operatingHours; }
    public void setOperatingHours(Double operatingHours) { this.operatingHours = operatingHours; }

    public Long getOdometerKm() { return odometerKm; }
    public void setOdometerKm(Long odometerKm) { this.odometerKm = odometerKm; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRawPayload() { return rawPayload; }
    public void setRawPayload(String rawPayload) { this.rawPayload = rawPayload; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getIngestedAt() { return ingestedAt; }
    public void setIngestedAt(Instant ingestedAt) { this.ingestedAt = ingestedAt; }
}
