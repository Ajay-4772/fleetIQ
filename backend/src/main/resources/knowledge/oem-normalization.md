# vehyron Multi-OEM Ingestion & Normalization Specification

## Problem Statement
Automotive manufacturers and third-party telematics providers output vehicle telemetry using incompatible proprietary JSON payloads, varying key names, and diverse timestamp formats.

## OEM Adapter Mappings

### 1. Toyota Adapter (`source: TOYOTA` or `SIMULATED_TOYOTA`)
- `vehicle_id` -> `CanonicalVehicleEvent.vehicleId`
- `fault` -> `CanonicalVehicleEvent.faultCode`
- `oil_life` -> `CanonicalVehicleEvent.oilLifePct`
- `battery_pct` -> `CanonicalVehicleEvent.batteryHealthPct`
- `idle_minutes` -> `CanonicalVehicleEvent.idleMinutes`
- `odometer` -> `CanonicalVehicleEvent.odometerKm`
- `timestamp` -> ISO-8601 UTC Instant

### 2. Ford Adapter (`source: FORD` or `SIMULATED_FORD`)
- `vehicleIdentifier` -> `CanonicalVehicleEvent.vehicleId`
- `diagnosticCode` -> `CanonicalVehicleEvent.faultCode`
- `oilLifePercentage` -> `CanonicalVehicleEvent.oilLifePct`
- `batteryState` -> `CanonicalVehicleEvent.batteryHealthPct`
- `idleDuration` -> `CanonicalVehicleEvent.idleMinutes`
- `mileage` -> `CanonicalVehicleEvent.odometerKm`
- `timestamp` -> ISO-8601 UTC Instant

### 3. BMW Adapter (`source: BMW` or `SIMULATED_BMW`)
- `vehicleIdentifier` -> `CanonicalVehicleEvent.vehicleId`
- `dtc` -> `CanonicalVehicleEvent.faultCode`
- `oil_life_remaining` -> `CanonicalVehicleEvent.oilLifePct`
- `batteryHealth` -> `CanonicalVehicleEvent.batteryHealthPct`
- `idlingTimeMinutes` -> `CanonicalVehicleEvent.idleMinutes`
- `totalDistanceKm` -> `CanonicalVehicleEvent.odometerKm`
- `timestamp` -> ISO-8601 UTC Instant

### 4. Tesla EV Adapter (`source: TESLA` or `SIMULATED_TESLA`)
- `vin_id` -> `CanonicalVehicleEvent.vehicleId`
- `alert_code` -> `CanonicalVehicleEvent.faultCode`
- `state_of_charge` -> `CanonicalVehicleEvent.batteryHealthPct`
- `idle_mins` -> `CanonicalVehicleEvent.idleMinutes`
- `odometer` -> `CanonicalVehicleEvent.odometerKm`
- `timestamp` -> ISO-8601 UTC Instant

## Canonical Schema
All events normalized into `CanonicalVehicleEvent` containing:
- `eventId`: UUID
- `vehicleId`: Standard vehicle identifier
- `timestamp`: UTC Instant
- `eventType`: ENGINE_FAULT, MAINTENANCE_DUE, BATTERY_WARNING, TIRE_PRESSURE_LOW, EXCESSIVE_IDLE, LOW_UTILIZATION, TELEMETRY_NORMAL
- `severity`: CRITICAL, HIGH, MEDIUM, LOW
- `source`: OEM source identifier
