# FleetIQ — Project Context

## 1. System Vision & Purpose
**FleetIQ** is an enterprise-grade connected vehicle intelligence and decision-engineering platform. It ingests heterogenous, proprietary telemetry events from multiple automotive OEMs (Tesla, Ford, BMW, Toyota), normalizes them into a unified canonical event representation, applies automated diagnostics and cost impact models, and executes intelligent action prioritization via an AI decision engine backed by a deterministic rules-based fallback.

The platform provides fleet dispatchers, operations managers, and safety compliance officers with real-time operational visibility through Server-Sent Events (SSE), an executive analytics dashboard, and a strictly grounded AI copilot that synthesizes technical manuals with real-time vehicle database state.

---

## 2. Core Architectural Principles
1. **Multi-OEM Ingestion Decoupling**: OEM-specific payloads vary drastically in terminology, sensor unit scales, and schema depth. OEM adapters normalize raw payloads into immutable `CanonicalVehicleEvent` entities before downstream processing.
2. **AI with Deterministic Fallback**: Machine learning / LLM decisions operate behind the `DecisionService` abstraction. If the upstream AI service (`JevDecisionService`) times out, encounters errors, or reports low confidence (< 0.80), the system automatically routes to `RuleBasedDecisionService` without latency spikes or operational disruption.
3. **Dual Database Tiering**: Developed with zero-friction local in-memory H2 (PostgreSQL dialect mode) for rapid test execution and standalone developer workflows, with full PostgreSQL production parity configured via Spring Profiles (`postgres`).
4. **Grounded Operations AI (Hybrid RAG)**: The conversational copilot (`/api/fleet/query`) does not hallucinate or use ungrounded public knowledge; it queries local markdown documentation knowledge bases (`resources/knowledge/*.md`) alongside live JPA database entities.
5. **Real-Time Push Architecture**: Operational updates are broadcast over HTTP SSE (`/api/v1/dashboard/stream`), eliminating heavy client-side polling while supporting deterministic event replay via the fleet simulator.

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
