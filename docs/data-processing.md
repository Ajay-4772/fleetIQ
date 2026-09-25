# VEHYRON — Data Processing Pipeline & Intelligence Engine

## 1. Pipeline Stages
Each vehicle event ingested by VEHYRON traverses strict, non-bypassable architectural gates:

```
[ INGESTED ] ──► [ RAW STORAGE ] ──► [ SCHEMA VALIDATION ] ──► [ CANONICAL NORMALIZATION ] 
                                                                           │
                                                                           ▼
[ PERSISTENCE & SSE ] ◄── [ MODULE ROUTING ] ◄── [ ISSUE & ACTION ENGINE ] ◄┘
```

### Stage 1: Ingestion
Connector receives payload from Kafka, MQTT, Webhook, REST, or CSV/Excel upload.

### Stage 2: Raw Storage
Original unmodified payload written to `raw_ingestion_records` for forensics.

### Stage 3: Schema Validation
Evaluates:
- Vehicle identifier presence
- VIN format / 17-character check
- Timestamp within valid bounds
- Physical sanity ranges:
  - Battery voltage: `0.0V - 1000.0V`
  - Oil life: `0% - 100%`
  - Tire pressure: `0.0 psi - 150.0 psi`
  - Mileage: `>= 0.0 km`

### Stage 4: Multi-OEM Normalization
Transforms proprietary OEM payload structures into unified `CanonicalVehicleEvent`.

### Stage 5: Intelligence & Decision Engine
Evaluates telemetry against deterministic threshold rules and AI-assisted models:
- **`BATTERY_WARNING`**: Battery health < 80% or voltage < 11.8V -> Priority CRITICAL / HIGH.
- **`MAINTENANCE_DUE`**: Oil life < 10% -> Priority HIGH.
- **`TIRE_PRESSURE_LOW`**: Tire pressure < 28.0 psi -> Priority HIGH / MEDIUM.
- **`ENGINE_FAULT`**: Active DTC fault code detected -> Priority CRITICAL.

### Stage 6: Module Routing
Events and derived decisions route automatically to:
- **Fleet Asset Registry**: Updates vehicle state & health score.
- **Live Operations Telemetry**: Publishes stream event.
- **Priority Action Center**: Generates actionable dispatch directive with estimated financial impact.
- **Fleet Health Index**: Recalculates live fleet readiness percentage.
- **SSE Stream**: Broadcasts delta to active browser sessions.
