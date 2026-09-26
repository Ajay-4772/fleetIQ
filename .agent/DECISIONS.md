# VEHYRON — Architecture & Engineering Decisions (ADR Index)

This registry tracks verified architectural choices and proposed future decisions. Full records are stored under `docs/decisions/ADR-XXX-<title>.md`.

---

## 1. Verified & Active Decisions

| ADR ID | Title | Status | Scope | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **[ADR-001](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/001-multi-oem-canonical-event-normalization.md)** | Multi-OEM Canonical Event Normalization | **ACCEPTED** | Ingestion / Domain | Decouple proprietary OEM telemetry formats via polymorphic `OemAdapter` implementations into an immutable `CanonicalVehicleEvent`. |
| **[ADR-002](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/002-ai-decision-abstraction-and-deterministic-fallback.md)** | AI Decision Abstraction & Deterministic Fallback | **ACCEPTED** | AI Decision Engine | Encapsulate external AI calls behind `DecisionService` with an automatic, zero-downtime failover to `RuleBasedDecisionService` upon timeout or error. |
| **[ADR-003](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/003-dual-tier-persistence-h2-dev-postgres-prod.md)** | Dual-Tier Persistence Strategy (H2 Dev / Postgres Prod) | **ACCEPTED** | Database | Use in-memory H2 with PostgreSQL syntax mode for lightning-fast test suites and zero-dependency local runs, paired with production PostgreSQL. |
| **[ADR-004](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/004-realtime-telemetry-streaming-via-sse.md)** | Real-Time Telemetry Streaming via Server-Sent Events | **ACCEPTED** | API / Realtime | Utilize HTTP Server-Sent Events (`/api/v1/dashboard/stream`) for unidirectional real-time updates over WebSocket due to simplicity and native HTTP auth. |
| **[ADR-005](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/005-grounded-hybrid-rag-assistant.md)** | Grounded Hybrid RAG Assistant | **ACCEPTED** | AI Copilot | Restrict fleet assistant responses strictly to indexed local operational documentation and live JPA repository lookups to eliminate hallucinations. |
| **[ADR-007](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/007-database-migration-tooling-flyway-proposal.md)** | Database Schema Migration Tooling (Flyway) | **ACCEPTED** | Database / DevOps | Replace Hibernate `ddl-auto: update` with Flyway versioned SQL migrations (`V1__initial_schema.sql`) and enforce Hibernate `ddl-auto: validate`. |
| **[ADR-008](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/008-distributed-tracing-opentelemetry-proposal.md)** | Distributed Tracing with OpenTelemetry | **ACCEPTED** | Observability | Implement W3C trace context propagation via Micrometer Tracing Otel bridge, `X-Trace-Id` response header, and MDC logging correlation. |
| **ADR-009** | VEHYRON Product Brand Identity & Strict Dual-Role RBAC Model | **ACCEPTED** | Identity / Governance | Migrate brand from VEHYRON to VEHYRON while preserving automotive domain concepts (`fleet`, `vehicle`). Enforce exactly two roles: `ROLE_ADMIN` and `ROLE_OPERATOR`. |
| **ADR-010** | Enterprise Ingestion Gateway & Zero-Demo Dynamic Baseline | **ACCEPTED** | Ingestion / Scalability | Implement pluggable connectors (Kafka, MQTT, REST, Webhooks, Cloud streams, POI/CSV streaming) with zero synthetic vehicles, dynamically hydrating the registry from real data. |
| **ADR-011** | Data-Driven Operational Analytics & Secure First-Admin Bootstrap Lifecycle | **ACCEPTED** | Analytics / Security | Eliminate all static/fake dashboard chart arrays, enforce typed backend analytics APIs with explicit empty states (differentiating NO DATA from ACTUAL ZERO), implement development-only auth reset, bootstrap root administrator Ajay via external secret without code exposure, and enforce public registration approval workflows. |

---

## 2. Proposed Architectural Decisions

| ADR ID | Title | Status | Scope | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **[ADR-006](file:///c:/Users/ajaya/Desktop/fleetiq/docs/decisions/006-distributed-event-broker-kafka-proposal.md)** | Distributed Event Broker Migration (Kafka/RabbitMQ) | **PROPOSED** | Ingestion / Scalability | Decouple high-throughput telemetry ingestion from HTTP servlet threads using partitioned event queues. |
