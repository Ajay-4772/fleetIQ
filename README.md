# VEHYRON — Connected Vehicle Intelligence Platform

> **Multi-OEM vehicle telemetry, event normalization, operational intelligence, and AI-assisted decision engineering platform.**

**VEHYRON** is a production-grade multi-OEM connected vehicle telemetry and operational decision platform. It ingests high-frequency telemetry events from external IoT brokers (Apache Kafka, MQTT), secure webhooks, cloud streams (GCP Pub/Sub, AWS Kinesis, Azure Event Hubs), REST pollers, and batch Excel/CSV datasets. It normalizes disparate schemas into a canonical domain model, evaluates operational integrity using deterministic rules and AI models, calculates financial risk, and routes prioritized operational actions to operators.

---

## 1. Core Mental Model

```
       REAL EXTERNAL DATA (Kafka / MQTT / REST / Webhook / Excel / CSV)
                                    ↓
                        INGESTION & RAW STORAGE
                                    ↓
                       CANONICAL NORMALIZATION
                                    ↓
                          INTELLIGENCE ENGINE
                                    ↓
                        EVENT & ISSUE DETECTION
                                    ↓
                         PRIORITY & ACTION QUEUE
                                    ↓
                    DATABASE & REAL-TIME SSE PUSH
                                    ↓
                      VEHYRON OPERATIONS PORTAL
```

VEHYRON answers four core operational questions in real time:
1. **What is happening?** (Live operations telemetry, normalized event stream)
2. **Which vehicles/issues need attention?** (Dynamic asset registry, DTC diagnostics, degradation states)
3. **Why does it matter?** (Explainable rule/AI decisioning, estimated financial risk)
4. **What should the operator do?** (Authoritative, prioritized action queue with lifecycle review)

---

## 2. End-to-End System Architecture

```text
External IoT / OEM Source / Gateway (Kafka, MQTT, Webhook, REST, Batch File)
                                ↓
                 VEHYRON Data Source Connectors
                                ↓
                 Raw Storage & Audit Persistence
                                ↓
                  Schema & Physical Validation
                                ↓
               Multi-OEM Normalization Pipeline
              (Toyota, Ford, BMW, Tesla, Vehyron)
                                ↓
                     Canonical Vehicle Event
                                ↓
                   PostgreSQL / H2 Persistence
                                ↓
                         Issue Detection
                                ↓
                    Operational Impact Engine
                                ↓
                     Hybrid Decision Engine
                   (Deterministic + AI Models)
                                ↓
                     Priority Action Dispatch
                                ↓
                     Event Publisher (Spring)
                                ↓
                    Real-Time HTTP SSE Stream
                   (GET /api/v1/dashboard/stream)
                                ↓
                   VEHYRON Operations UI (React)
```

---

## 3. Simplified Frontend Information Architecture

The frontend is streamlined into 6 primary operational areas:

1. **OVERVIEW**: Executive fleet health index, monitored assets, active utilization, operational risk, critical alert banners, health scrubber chart, and prioritized action dispatch.
2. **LIVE OPERATIONS**: Sub-second Server-Sent Events (SSE) telemetry feed normalized across multi-OEM ingestion adapters.
3. **VEHICLES**: Comprehensive asset registry with synthetic VINs, fuel types, battery health (EV), oil life remaining, tire pressure, and individual vehicle diagnostic profiles.
4. **ACTIONS**: Authoritative operational action queue (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`) with operator triage, technician notes, and strict RBAC protection.
5. **INTELLIGENCE**: Explainability center detailing multi-signal rule calibrations, fallback metrics, confidence distributions, and financial risk breakdown.
6. **SYSTEM**: Real-time backend service status, database connectivity, ingestion counters, normalizer success rates, schema pass rates, and SSE stream health.

### Operational Tools
- **AI Assistant Copilot**: Globally accessible drawer providing grounded fleet answers and SAE diagnostic definitions.
- **Scenario Simulator Tool**: Operational modal for injecting deterministic multi-OEM telematics test scenarios through the production ingestion pipeline.

---

## 4. Key Engineering Capabilities

### A. Real-Time Telemetry Streaming (SSE)
- **Endpoint**: `GET /api/v1/stream/events`
- **Mechanism**: Server-Sent Events (`text/event-stream`) pushing sub-second updates for `VEHICLE_EVENT`, `CRITICAL_ALERT`, `ACTION_CREATED`, and `ACTION_UPDATED`.
- **Client Resilience**: Automatic reconnection with exponential backoff and dynamic connection badges (`LIVE`, `RECONNECTING`, `OFFLINE`).

### B. External Telematics Ingestion Boundary
- **Endpoint**: `POST /api/v1/events/ingest`
- **Security**: Service-to-service authentication via `X-API-Key: fleetiq-ingest-secure-key-2026` or authorized JWT bearer token.
- **Traceability**: Unique correlation IDs propagated across ingestion, normalization, decisioning, actions, and UI broadcast.
- **Idempotency Protection**: In-memory and database deduplication cache preventing duplicate telemetry events from triggering duplicate work orders.

### C. Enterprise Security & Role-Based Access Control (RBAC)
- **Stateless JWT**: Standard 24-hour cryptographically signed tokens.
- **BCrypt Password Hashing**: Encrypted user credentials.
- **Role Permissions**:
  - `ROLE_ADMIN`: Complete system administration, settings, and override capabilities.
  - `ROLE_OPERATIONS_LEAD`: Scenario simulation, operational oversight, and export.
  - `ROLE_OPERATOR`: Action lifecycle management (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `DISMISSED`) and notes logging.
  - `ROLE_VIEWER`: Read-only access across dashboard, registry, and search. Action mutations return **403 Forbidden**.

### Default Seeded User Accounts:
| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@FleetIQ2026` | `ROLE_ADMIN` |
| `ops_lead` | `Ops@FleetIQ2026` | `ROLE_OPERATIONS_LEAD` |
| `operator` | `Operator@FleetIQ2026` | `ROLE_OPERATOR` |
| `viewer` | `Viewer@FleetIQ2026` | `ROLE_VIEWER` |

### D. Grounded AI Assistant (Live Data vs. Technical Knowledge RAG)
FleetIQ strictly distinguishes between real-time database state and domain documentation:
- **Live Fleet Data**: Queries PostgreSQL directly via parameterized JPA repositories for vehicle counts, active DTCs, open actions, and critical assets. Vector search is **never** used for live fleet counts.
- **Technical Knowledge (RAG)**: Retrieves definitions from indexed automotive knowledge documents (`src/main/resources/knowledge/*.md`) for SAE DTCs (e.g., P0300, P0171, P0562, P0217), OEM normalizer specifications, and decision thresholds.
- **Hybrid Reasoning**: Combines live database matches with technical knowledge context to produce grounded operator recommendations.
- **Zero-Downtime Fallback**: If an external AI provider is unavailable, deterministic rule-based evaluation delivers 100% accurate, factual answers without hallucination.

### E. Production Data Export & Multi-Entity Search
- **CSV & JSON Export**: Real backend export endpoints (`/api/v1/export/vehicles`, `/api/v1/export/actions`, `/api/v1/export/events`).
- **Global Search**: Search across vehicles, actions, events, and diagnostic trouble codes simultaneously.

---

## 5. Quick Start & Running Locally

### Prerequisites
- Java 17+
- Node.js 18+ and npm
- Maven 3.8+

### 1. Start Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```
*Backend runs at: `http://localhost:8080`*
*H2 Console (dev profile): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:fleetiq`, user: `SA`, password: empty)*

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 6. Verification & Automated Test Suite

FleetIQ includes 42 comprehensive automated tests covering security, ingestion, decisioning, RAG, export, and normalization:

```bash
cd backend
mvn test
```

### Test Coverage Highlights:
- `SecurityAndAuthTests`: Login success, bad password rejection, viewer mutation forbidden (403), operator mutation allowed (200), service-to-service API key validation, anonymous ingestion rejection.
- `AiAssistantAndRagTests`: Critical vehicle live queries, RAG technical DTC retrieval, hybrid query routing, RAG index verification.
- `ExportAndSearchTests`: Real CSV vehicle/action export generation, multi-entity search across vehicles, actions, and events.
- `DecisionAndAiFallbackTests`: Deterministic rule evaluation, AI fallback simulation, confidence scoring, human review flagging.
- `DetectionAndImpactTests`: DTC categorization, low oil life degradation, financial risk estimation.
- `NormalizationTests`: Multi-OEM payload parsing (Toyota, Ford, BMW, Tesla) and schema range validation.

---

## 7. Documentation Index

Detailed documentation is available in the [`docs/`](./docs) directory:
- [Architecture & System Design](./docs/ARCHITECTURE.md)
- [Real-Time SSE Streaming](./docs/REALTIME.md)
- [Security & Authentication](./docs/SECURITY.md)
- [Grounded AI Assistant](./docs/AI_ASSISTANT.md)
- [RAG Technical Knowledge Retrieval](./docs/RAG.md)
- [External Telematics Integration Guide](./docs/INTEGRATION_GUIDE.md)
- [Data Sources & Synthetic Generation](./docs/DATA_SOURCES.md)
- [Data Licensing](./docs/DATA_LICENSES.md)

---

## 8. Data Ethics & Licensing Compliance

FleetIQ uses **100% synthetic, legally reusable, open-standard data**:
- All VINs are synthetically generated (`SYNTH-...`).
- Diagnostic trouble codes follow public **SAE J2012 / OBD-II** standards.
- No proprietary OEM data, confidential fleet information, or private keys are stored.
