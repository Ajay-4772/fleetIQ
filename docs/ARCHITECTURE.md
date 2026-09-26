# VEHYRON — Architecture & System Design

## 1. What VEHYRON Is
**VEHYRON** is an enterprise-grade, real-time connected vehicle data intelligence platform. It ingests high-frequency, multi-OEM telematics streams (Toyota, Ford, BMW, Tesla EV), normalizes disparate schemas into a canonical standard, evaluates operational integrity using rule engines and AI models, calculates financial risk, and dispatches prioritized operational actions to fleet managers.

---

## 2. Core Mental Model

```
       DATA
        ↓
   INTELLIGENCE
        ↓
     ACTIONS
        ↓
    OPERATIONS
```

VEHYRON answers four core operational questions:
1. **What is happening?** (Live operations feed, normalized telemetry events)
2. **Which vehicles/issues need attention?** (Vehicle health scores, DTCs, degradation states)
3. **Why does it matter?** (Explainable rule/AI decisioning, estimated operational risk in currency)
4. **What should the operator do?** (Authoritative, prioritized action queue with lifecycle workflows)

---

## 3. High-Level System Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                      EXTERNAL PRODUCERS                                           |
|  [OEM Cloud Gateways]     [Telematics Webhooks]     [Fleet Message Brokers]    [Scenario Simulator]|
+---------------------------------------------------------------------------------------------------+
                                                  │
                                      POST /api/v1/events/ingest
                                      (X-API-Key: vehyron-ingest-secure-key-2026)
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                      INGESTION BOUNDARY                                           |
|  - ApiKeyAuthenticationFilter & Security Context Validation                                       |
|  - Correlation ID Assignment (Traceability across pipeline)                                       |
|  - Idempotency Deduplication Key Cache (Prevents duplicate message reprocessing)                  |
|  - Raw Ingestion Audit Logging (PostgreSQL / H2)                                                  |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                  NORMALIZATION PIPELINE                                           |
|  - Multi-OEM Adapter Routing:                                                                     |
|      * ToyotaAdapter (vehicle_id, oil_life, idle_minutes, DTC)                                    |
|      * FordAdapter (vehicleIdentifier, oilLifePercentage, idleDuration, diagnosticCode)            |
|      * BmwAdapter (vehicleIdentifier, oil_life_remaining, dtc, idlingTimeMinutes)                 |
|      * TeslaEvAdapter (vin, battery_state_of_charge, thermal_runaway_warning)                     |
|  - Schema Validation & Range Sanitization                                                         |
|  - Canonical Event Generation (CanonicalVehicleEvent)                                             |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                               INTELLIGENCE & DECISION ENGINE                                      |
|  - Issue Detection Engine (Pattern recognition across DTCs, thresholds, degradation curves)       |
|  - Operational Impact Calculator (Estimates catastrophic breakdown risk in financial terms)       |
|  - Authoritative Decision Engine:                                                                 |
|      * RuleBasedDecisionService (Deterministic baseline)                                          |
|      * JevDecisionService (External LLM / ML evaluation)                                          |
|      * HybridDecisionService with Graceful Fallback                                               |
|  - Human Review Flagging (Automated triage vs. human intervention)                                |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                     ACTION DISPATCH                                               |
|  - Priority Action Engine (Generates ActionItem with lifecycle: OPEN, IN_PROGRESS, RESOLVED)      |
|  - PostgreSQL Persistence (Source of truth)                                                       |
|  - Spring Security RBAC Enforcement (Only Operator, Ops Lead, Admin can mutate action status)     |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                   REAL-TIME BROADCAST                                             |
|  - DashboardEventPublisher & SseEmitterService                                                    |
|  - Server-Sent Events (SSE) Stream: GET /api/v1/stream/events (Sub-second browser push)           |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
|                                SIMPLIFIED FRONTEND (REACT / VITE)                                 |
|  - 6 Clean Primary Tabs: Overview, Live Operations, Vehicles, Actions, Intelligence, System       |
|  - Global Search (Vehicles, Actions, Events, DTCs)                                                |
|  - Global AI Assistant Copilot (Distinguishes Live Fleet Data from RAG Knowledge)                 |
|  - Operational Tools Modal: Scenario Simulator                                                    |
|  - Real Production Data Export (Vehicles, Actions, Events as CSV / JSON)                          |
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Key Architectural Decisions

1. **PostgreSQL as Sole Source of Truth**:
   The frontend never fabricates state or maintains divergent client-only statistics. Every KPI originates from backend aggregation queries (`DashboardAggregationService`).
2. **Stateless JWT + Service-to-Service API Key**:
   Browser users authenticate via JWT tokens issued by `/api/v1/auth/login`. External telematics systems authenticate via the `X-API-Key` HTTP header.
3. **Non-Blocking SSE Streaming**:
   Server-Sent Events push lightweight notifications (`VEHICLE_EVENT`, `CRITICAL_ALERT`, `ACTION_CREATED`, `ACTION_UPDATED`) to connected browsers, triggering targeted delta updates rather than full-page refreshes.
4. **Offline-Resilient Intelligence**:
   If an external AI provider (Jev / Gemini) is unreachable, the system executes deterministic rule-based evaluation with 100% uptime.
5. **No Technology Bloat**:
   Built cleanly with Spring Boot 3, Java 17, React 18, TailwindCSS, and PostgreSQL/pgvector. Avoids premature microservices, Kafka brokers, or unnecessary third-party vector databases.
