# FleetIQ AI Engineering Environment — Setup & Governance Report

**Project**: FleetIQ Connected Vehicle Intelligence Platform  
**Setup Date**: September 25, 2026  
**Environment Status**: Complete & Fully Verified

---

## 1. Installed Tools & Capabilities

### 1.1 Architect Skills
- **Package**: `imadnan4/architect-skills`
- **Installation Method**: `npx skills add imadnan4/architect-skills -y --all`
- **Location**: `.agents/skills/` (workspace customization root)
- **Skills Discoverable (11 total)**:
  1. `ai-system-architecture`
  2. `api-domain-architecture`
  3. `architecture-decision-framework`
  4. `architecture-principles`
  5. `architecture-review`
  6. `codebase-architecture`
  7. `context-engineering`
  8. `database-intelligence`
  9. `production-engineering`
  10. `scalability-distributed-systems`
  11. `security-by-design`
- **Context Governance**: Targeted dynamic loading configured in `AGENTS.md` and `GEMINI.md`. Skills are only loaded when their specific domain is relevant.

### 1.2 Agent Compass
- **Repository**: `https://github.com/me-cedric/agent-compass.git`
- **Installation Method**: Added as Git submodule at `docs/agent-compass`, adopted via `node docs/agent-compass/scripts/adopt.mjs .`.
- **Artifacts Established**:
  - `specs/constitution.md` (Engineering contract and non-negotiables)
  - `specs/README.md` (Specification workflow)
  - `docs/architecture/repo-map.md` (Structural repo mapping)
  - `agent-compass.commands.json` (Configured with actual Maven and NPM build/test commands)
  - Quality gates, recommendations, migration plans, and doctor checks.
- **Readiness Verification**: Executed `node docs/agent-compass/scripts/doctor-report.mjs .` — All required checks passing with zero local path leaks.

### 1.3 Codebase Memory MCP
- **Binary**: `codebase-memory-mcp.exe` v0.11.0 installed in `C:\Users\ajaya\AppData\Local\Programs\codebase-memory-mcp\codebase-memory-mcp.exe` and added to User PATH.
- **Installation Method**: Official upstream Windows installation script inspected and executed via PowerShell.
- **Index Status**:
  - Nodes: **7,774**
  - Edges: **15,735**
  - Languages parsed: Java (84 files), TypeScript (26 files), YAML, TOML, Bash, CSS, HTML.
  - Persistent knowledge graph written to `.codebase-memory/graph.db.zst`.
  - Background capabilities: `auto_watch = true` and `auto_index = true`.

---

## 2. Existing Tools & Configurations Verified

Prior to installation, the repository was audited and the following pre-existing configurations were preserved:
- **Java 17 LTS & Apache Maven 3.9.16**: Active runtime environment verified.
- **Spring Boot 3.3.2 Backend**: Controllers, services, models, repositories, and test suites in `backend/pom.xml`.
- **React 18 & Vite Frontend**: TypeScript SPA with Tailwind CSS in `frontend/package.json`.
- **Docker & Docker Compose**: Multi-container setup (`docker-compose.yml`) defining PostgreSQL, backend, and frontend containers.
- **Global Antigravity Configuration**: Inspected `C:\Users\ajaya\.gemini\config\mcp_config.json` containing `chrome-devtools-mcp` (preserved without modification).
- **Application Source Code**: `backend/src/main/` and `frontend/src/` kept 100% unchanged.

---

## 3. Configuration Locations

| Configuration Item | Location | Purpose |
| :--- | :--- | :--- |
| **Project-Local Antigravity MCP** | `.gemini/config/mcp_config.json` | Configures `codebase-memory` MCP server for Antigravity without global pollution. |
| **Architect Skills** | `.agents/skills/<skill-name>/SKILL.md` | Provides 11 on-demand architectural engineering skill sets. |
| **Agent Compass Submodule** | `docs/agent-compass/` | Shared agent governance contract and doctor scripts. |
| **Agent Guidelines & Rules** | `AGENTS.md` & `GEMINI.md` | Mandatory startup workflow, pre-coding rules, implementation standards, and pre-finishing checklist. |
| **Agent CLI Commands** | `agent-compass.commands.json` | Maps build, test, lint, and typecheck commands for AI tools. |
| **Application Runtime Config** | `backend/src/main/resources/application.yml` | Spring Boot configuration for `dev` (H2) and `postgres` profiles. |
| **Multi-Container Stack** | `docker-compose.yml` | Container orchestration for PostgreSQL, backend, and frontend. |

---

## 4. Project Intelligence Architecture

### 4.1 Project Memory (`.agent/`)
- [PROJECT_CONTEXT.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/PROJECT_CONTEXT.md): System vision, multi-OEM goals, and core architectural principles.
- [CURRENT_STATE.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/CURRENT_STATE.md): Active milestones, subsystem operational status, and verification baselines.
- [ARCHITECTURE.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/ARCHITECTURE.md): System overview, module boundaries, database architecture, event flow, and AI decision fallback.
- [DOMAIN_KNOWLEDGE.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/DOMAIN_KNOWLEDGE.md): Verified domain vocabulary (`Vehicle`, `OemAdapter`, `CanonicalVehicleEvent`, `ActionItem`, `Decision`).
- [DECISIONS.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/DECISIONS.md): ADR index referencing active and proposed decisions.
- [KNOWN_ISSUES.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/KNOWN_ISSUES.md): Technical debt catalog (in-memory SSE, Hibernate ddl-auto, Windows hook modes).
- [ENGINEERING_STANDARDS.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/ENGINEERING_STANDARDS.md): Java/Spring, React/TypeScript, REST, and concurrency conventions.
- [TEST_STRATEGY.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/TEST_STRATEGY.md): Testing pyramid, test suite catalog, and mandatory AI fallback testing requirements.
- [SECURITY.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/SECURITY.md): JWT authentication, RBAC roles, input validation, and secret hygiene.
- [OBSERVABILITY.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/OBSERVABILITY.md): Actuator endpoints, business metrics, and structured logging standards.
- [DEPLOYMENT.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/DEPLOYMENT.md): Container architecture, environment variables, runbooks, and rollback strategy.
- [OPERATIONS.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/OPERATIONS.md): Liveness/readiness probes, retry/timeout policies, and failure isolation.
- [SESSION_LOG.md](file:///c:/Users/ajaya/Desktop/fleetiq/.agent/SESSION_LOG.md): Chronological record of environment setup actions and verification results.

### 4.2 Architecture Decision Records (`docs/decisions/`)
- **ADR-001**: Multi-OEM Canonical Event Normalization (**ACCEPTED**)
- **ADR-002**: AI Decision Abstraction & Deterministic Fallback (**ACCEPTED**)
- **ADR-003**: Dual-Tier Persistence Strategy (H2 Dev / PostgreSQL Prod) (**ACCEPTED**)
- **ADR-004**: Real-Time Telemetry Streaming via Server-Sent Events (**ACCEPTED**)
- **ADR-005**: Grounded Hybrid RAG Assistant (**ACCEPTED**)
- **ADR-006**: Distributed Event Broker Migration (Kafka/RabbitMQ) (**PROPOSED**)
- **ADR-007**: Database Schema Migration Tooling (Flyway) (**PROPOSED**)
- **ADR-008**: Distributed Tracing with OpenTelemetry (**PROPOSED**)

### 4.3 Codebase Knowledge Graph
- Built and indexed via `codebase-memory-mcp`.
- Models 117 classes, 44 interfaces, 36 REST routes, 739 methods, and 15,735 relationship edges across the entire repository.
- Queryable via `query_graph`, `search_graph`, and `get_architecture`.

### 4.4 Agent Instructions & Governance
- `AGENTS.md` and `GEMINI.md` establish the strict 13-step AI Startup Workflow with targeted retrieval, explicit Pre-Coding rules, Implementation invariants, and Pre-Finishing verification gates.

---

## 5. Verification Results

| Subsystem / Tool | Command / Check | Result | Detail |
| :--- | :--- | :--- | :--- |
| **Architect Skills** | File discovery in `.agents/skills/` | **PASS** | All 11 skills verified present with valid `SKILL.md`. |
| **Agent Compass** | `node docs/agent-compass/scripts/doctor-report.mjs .` | **PASS** | All required checks passed; 0 local path leaks. |
| **Codebase Memory MCP** | `codebase-memory-mcp cli index_status` | **PASS** | Status `ready`, 7,774 nodes, 15,735 edges. |
| **Antigravity MCP Config** | Read `.gemini/config/mcp_config.json` | **PASS** | Project-local config points cleanly to `codebase-memory`. |
| **Project Intelligence** | File inspection in `.agent/` and `docs/` | **PASS** | All 13 `.agent/` files and 7 `docs/` subdirectories present. |
| **Backend Test Suite** | `mvn test -f backend/pom.xml` | **PASS** | **42 tests executed across 8 test suites, 0 failures, 0 errors.** |
| **Frontend Production Build** | `npm run build --prefix frontend` | **PASS** | **1,585 modules transformed cleanly in Vite, 0 errors.** |
| **Source Code Integrity** | `git status` inspection | **PASS** | `backend/src/` and `frontend/src/` remain completely untouched. |

---

## 6. Remaining Gaps

1. **Database Migration Tooling**: The project currently relies on Hibernate's `ddl-auto: update`. Production grade deployments require migrating to Flyway versioned SQL scripts (tracked in `ADR-007`).
2. **Distributed Telemetry Ingestion**: Telemetry is currently ingested over synchronous HTTP endpoints. For high-volume fleet scales (> 10k vehicles), asynchronous ingestion via Kafka or RabbitMQ is recommended (tracked in `ADR-006`).
3. **Multi-Node SSE Broadcasting**: SSE connection state is currently held in an in-memory map on the backend instance. Clustering requires a Redis Pub/Sub backplane.
4. **CI/CD Automation**: GitHub Actions workflow configuration for automated pull request builds and test runs should be formalized.

---

## 7. Recommended Next Step

**Milestone: Introduce Database Migration Tooling (Flyway)**
- Target: Replace Hibernate `ddl-auto: update` with Flyway versioned migrations (`V1__initial_schema.sql` based on the 6 JPA entities).
- Rationale: Establishes schema reproducibility before any further domain features or multi-OEM adapters are expanded.
