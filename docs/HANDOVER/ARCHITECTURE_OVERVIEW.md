# FleetIQ — Architectural Architecture Overview

**Document Version:** 1.0.0-PROD  
**Classification:** Architectural Blueprint  
**Audience:** Principal Architects, Systems Engineers

---

## 1. High-Level System Architecture

```
                    ┌─────────────────────────┐
                    │  Fleet Telematics Units │
                    │ (Toyota, Ford, BMW, EV) │
                    └────────────┬────────────┘
                                 │ HTTP POST
                                 ▼
                    ┌─────────────────────────┐
                    │   Application Gateway   │
                    │  (RateLimitingFilter)   │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  Spring Security Filter │     │ Real-Time SSE Stream    │
    │  (JWT Authentication)   │     │ (/api/v1/telemetry/sse) │
    └────────────┬────────────┘     └─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────────────────────────┐
    │                 Core Service Layer                      │
    │                                                         │
    │  [TelemetryIngestion] ──> [CanonicalNormalizer]         │
    │                                   │                     │
    │                                   ▼                     │
    │                           [DecisionEngine]              │
    │                            (Deterministic)              │
    │                                   │                     │
    │         ┌─────────────────────────┼───────────────┐     │
    │         ▼                         ▼               ▼     │
    │   [PriorityQueue]        [AIModelProvider]  [UserService]
    │   (Actions/Orders)         (Copilot/RAG)    (RBAC/Audit)│
    └───────────────────────────────────┬─────────────────────┘
                                        │
                                        ▼
    ┌─────────────────────────────────────────────────────────┐
    │                 PostgreSQL Persistence                  │
    │                                                         │
    │  - vehicles                 - user_audit_logs           │
    │  - vehicle_events           - chat_conversations        │
    │  - priority_actions         - chat_messages             │
    │  - users                    - flyway_schema_history     │
    └─────────────────────────────────────────────────────────┘
```

---

## 2. Canonical Normalization Pipeline

Raw payloads from heterogeneous vehicle manufacturers contain diverse structures:
- **Toyota:** Emits `hybridBatteryState`, `evDriveEfficiency`, `dtcCodes`.
- **Ford:** Emits `engineOilLifeRemaining`, `canBusFaults`, `transmissionTemp`.
- **BMW:** Emits `conditionBasedServiceStatus`, `telemetryPackets`.
- **Tesla:** Emits `hvBatteryPackTemp`, `bmsAlerts`, `fleetPackId`.

The `CanonicalNormalizerService` parses incoming payloads into a unified domain model:
```java
public class VehicleEvent {
    private String eventId;
    private String vehicleId;
    private String oem; // TOYOTA, FORD, BMW, TESLA
    private LocalDateTime timestamp;
    private Double speedKmh;
    private Double batterySoc;
    private Double coolantTempC;
    private List<String> diagnosticCodes;
    private String severity; // INFO, WARNING, CRITICAL
}
```
Downstream decision algorithms and the AI Copilot interact exclusively with this normalized domain model, isolating core business logic from manufacturer API changes.
