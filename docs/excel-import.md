# Batch Excel / CSV Dataset Ingestion

## Overview
VEHYRON supports batch file ingestion for Microsoft Excel (`.xlsx`) and Comma-Separated Values (`.csv`) files. Uploaded datasets are treated strictly as **BATCH INGESTION** and tagged with the `IMPORTED` freshness badge, never masquerading as live real-time streams.

## Ingestion Flow
1. **File Selection**: Admin drags and drops `.xlsx` or `.csv` in `/admin/ingestion`.
2. **Schema Inspection & Preview**: Backend inspects header columns, detects mapping to canonical fields, and returns a 3-row sample preview.
3. **Admin Mapping Confirmation**: Admin reviews or modifies inferred column mappings.
4. **Asynchronous Streaming Processing**: Uses Apache POI Event Model / Apache Commons CSV streaming to ingest rows without memory overflow.
5. **Auto-Registration & Routing**: Newly detected vehicles are dynamically registered in `VehicleRepository`, telemetry snapshots are updated, issues classified, and operational actions generated.
6. **Traceability**: An `IngestionJob` record is persisted tracking records received, processed, rejected, and execution duration.

## Flexible Column Mappings
The engine intelligently maps heterogeneous naming conventions:
- `vehicle_id`, `unit_id`, `asset_id`, `vehicleId` -> `vehicleId`
- `vin`, `vin_number`, `chassis_no` -> `vin`
- `battery`, `battery_voltage`, `battery_v` -> `batteryVoltage`
- `oil_life`, `oil_percent`, `oil_pct` -> `oilLife`
- `tire_pressure`, `tire_psi`, `psi` -> `tirePressure`
- `mileage`, `odometer`, `odo_km` -> `mileage`
- `timestamp`, `event_time`, `date_time` -> `eventTime`
