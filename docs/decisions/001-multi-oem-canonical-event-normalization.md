# ADR-001: Multi-OEM Canonical Event Normalization

## Status
**ACCEPTED** (Verified in codebase)

## Context
Connected vehicles from various automotive manufacturers (Tesla, Ford, BMW, Toyota) emit telemetry data using conflicting payload schemas, naming conventions, and measurement units:
- Tesla uses battery-percentage and proprietary event alert strings.
- Ford uses SAE J2012 fault codes and imperial units in nested diagnostic records.
- BMW provides Condition Based Servicing (CBS) and metric brake wear percentages.
- Toyota delivers hybrid battery state and OBD-II trouble codes.

Exposing core business logic, diagnostics, and AI services to multiple OEM payload dialects causes severe coupling and technical debt.

## Decision
1. Introduce an `OemAdapter` interface defining `boolean supports(String oem)` and `CanonicalVehicleEvent normalize(String rawJson)`.
2. Implement dedicated adapters: `TeslaEvAdapter`, `FordAdapter`, `BmwAdapter`, and `ToyotaAdapter`.
3. Standardize on the immutable `CanonicalVehicleEvent` JPA entity using standard units (speed in km/h, distance in km, levels in 0–100%, tire pressure in PSI).
4. Persist raw payloads in `RawIngestionRecord` before normalization for auditability.

## Consequences
### Positive
- Downstream services (detection, impact calculation, action prioritization, SSE) depend solely on `CanonicalVehicleEvent`.
- New OEMs can be supported simply by adding a new `OemAdapter` without altering existing business logic.
### Negative / Trade-offs
- CPU overhead for JSON serialization and field mapping upon ingestion.
- Need for continuous adapter test suites to handle OEM upstream schema shifts.
