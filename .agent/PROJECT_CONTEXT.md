# VEHYRON — Project Context

## 1. System Vision & Purpose
**VEHYRON** (Connected Vehicle Intelligence Platform) is a production-grade multi-OEM vehicle telemetry, event normalization, operational intelligence, decision-engineering, and AI platform. It ingests heterogeneous, proprietary telemetry events from multiple automotive OEMs (Tesla, Ford, BMW, Toyota) and IoT gateways, normalizes them into a unified canonical event representation, applies automated diagnostics and cost impact models, and executes intelligent action prioritization via an AI decision engine backed by deterministic rules-based fallback.

The platform provides fleet dispatchers, operations managers, and safety compliance officers with real-time operational visibility through Server-Sent Events (SSE), an executive analytics dashboard, an enterprise data ingestion gateway, and a strictly grounded AI copilot that synthesizes technical manuals with real-time vehicle database state.

---

## 2. Core Architectural Principles
1. **Multi-OEM Ingestion Gateway & Connectors**: Ingests live telemetry from Apache Kafka, MQTT/IoT, REST pollers, secure webhooks, GCP Pub/Sub, AWS Kinesis, Azure Event Hubs, and batch Excel/CSV datasets. Connectors normalize raw payloads into immutable `CanonicalVehicleEvent` entities.
2. **Strict Dual-Role RBAC Model**: Exactly two platform roles: `ROLE_ADMIN` (governance, user lifecycle, connectors, upload, system health) and `ROLE_OPERATOR` (operational telemetry, asset registry, diagnostics, action queue, AI copilot).
3. **Zero Synthetic / Demo Data Baseline**: Clean deployments operate with zero hardcoded vehicles; asset registries and health metrics dynamically hydrate strictly from verified incoming data streams.
4. **AI with Deterministic Fallback**: Machine learning / LLM decisions operate behind the `DecisionService` abstraction. If upstream AI services encounter errors or report low confidence (< 0.80), the system automatically routes to `RuleBasedDecisionService` without latency spikes or operational disruption.
5. **Dual Database Tiering**: Developed with zero-friction local in-memory H2 (PostgreSQL dialect mode) for rapid test execution, with full PostgreSQL production parity configured via Spring Profiles (`postgres`).
6. **Grounded Operations AI (Hybrid RAG)**: The conversational copilot (`/api/fleet/query`) does not hallucinate; it queries local markdown documentation knowledge bases (`resources/knowledge/*.md`) alongside live JPA database entities.
7. **Real-Time Push Architecture**: Operational updates are broadcast over HTTP SSE (`/api/v1/dashboard/stream`), eliminating heavy client-side polling while supporting deterministic event replay.

---

## 3. Technology Stack Reference
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language** | Java | 17 LTS | Core backend runtime |
| **Framework** | Spring Boot | 3.3.2 | Web, JPA, Security, Actuator |
| **Persistence** | PostgreSQL / H2 | 16 / 2.2 | Production DB / Dev In-Memory DB |
| **ORM** | Hibernate / Spring Data JPA | 6.5 | Object-relational mapping |
| **Security** | Spring Security 6 + JJWT | 0.12.6 | Stateless JWT auth & RBAC |
| **Observability** | Spring Boot Actuator | 3.3.2 | Health, Metrics, Info |
| **Testing** | JUnit 5 + Mockito + Spring Test | 5.10 / 5.2 | Comprehensive unit & integration suite |
| **Frontend** | React + TypeScript + Vite | 18.3 / 5.3 | Operations UI & Real-Time Dashboard |
| **Styling** | Vanilla CSS + Tailwind CSS | 3.4 | Clean enterprise operations dashboard |
| **Containerization** | Docker + Docker Compose | Compose v2 | Multi-container dev & production deployment |
| **AI Decision Engine** | JEV Decision API / Rules Engine | v1 | Automated prioritization & fallback |
| **Code Intelligence** | Codebase Memory MCP | 0.11.0 | AST & knowledge graph codebase navigation |
| **Agent Governance** | Agent Compass | Submodule | Engineering contracts, gates, & specs |
