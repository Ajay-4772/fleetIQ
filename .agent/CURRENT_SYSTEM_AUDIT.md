# FleetIQ — Current System & Production Readiness Audit

**Audit Date**: September 25, 2026  
**Auditor**: Principal Software Architect & Lead Systems Engineer  
**Workspace**: `c:\Users\ajaya\Desktop\fleetiq`  
**Commit / Branch**: `main`

---

## Executive Summary

This audit performs an evidence-based inspection of the actual FleetIQ codebase across the backend, frontend, database, AI/RAG subsystems, security, operations, and deployment tooling. No capability is claimed unless verified directly in source code.

---

## 1. Component & Capability Classification Matrix

| Domain | Capability / Component | Status | Code Evidence & Notes |
| :--- | :--- | :--- | :--- |
| **Backend** | Spring Boot 3.3.2 / Java 17 | **IMPLEMENTED** | `backend/pom.xml`, `FleetIqApplication.java` |
| **Backend** | Multi-OEM Normalization | **IMPLEMENTED** | `TeslaEventNormalizer`, `FordEventNormalizer`, `BmwEventNormalizer`, `ToyotaEventNormalizer` |
| **Backend** | Deterministic Rule Decision Engine | **IMPLEMENTED** | `RuleBasedDecisionService.java` evaluates safety & operational rules deterministically |
| **Backend** | Hybrid Decision Engine | **IMPLEMENTED** | `HybridDecisionService.java` coordinates AI evaluation with deterministic fallback |
| **Backend** | Financial Impact Calculator | **IMPLEMENTED** | `BusinessImpactCalculator.java` computes cost of downtime, battery degradation, oil loss |
| **Backend** | Real-Time SSE Stream | **IMPLEMENTED** | `SseEmitterService.java`, `StreamController.java` (`/api/v1/dashboard/stream`) |
| **Backend** | Distributed Tracing (OpenTelemetry) | **IMPLEMENTED** | `micrometer-tracing-bridge-otel`, `TraceResponseFilter.java`, `X-Trace-Id` headers |
| **Backend** | Global Error Handling | **MISSING** | No `@ControllerAdvice` or `@ExceptionHandler`. Handled per-controller via try-catch |
| **Backend** | API Rate Limiting | **MISSING** | No rate limiting filter or Bucket4j/Redis implementation found |
| **Database** | Schema Migration Tooling | **IMPLEMENTED** | Flyway 10 (`V1__initial_schema.sql`) managing 6 core tables |
| **Database** | Schema Validation | **IMPLEMENTED** | Hibernate `ddl-auto: validate` enforced across `dev` and `postgres` profiles |
| **Database** | Production DB Profile | **IMPLEMENTED** | PostgreSQL dialect & driver configured in `application.yml` (`postgres` profile) |
| **Database** | Conversation History Schema | **MISSING** | No tables for persistent user chats, messages, citations, or conversation threads |
| **Auth & Security** | JWT Authentication | **IMPLEMENTED** | `JwtTokenProvider.java`, `JwtAuthenticationFilter.java` validating Bearer tokens |
| **Auth & Security** | Ingestion API Key Filter | **IMPLEMENTED** | `ApiKeyAuthenticationFilter.java` (`X-API-Key` header enforcement) |
| **Auth & Security** | Password Hashing | **IMPLEMENTED** | BCrypt password encoder in `SecurityConfig.java` |
| **Auth & Security** | Demo Credentials in Backend | **HARDCODED** | `DataInitializer.java` seeds 4 hardcoded accounts (`Admin@FleetIQ2026`, etc.) |
| **Auth & Security** | Frontend Auto-Login & Hardcoded Credentials | **DEMO / INSECURE** | `AuthContext.tsx` contains hardcoded `DEMO_CREDENTIALS` and auto-logs in as `ops_lead` |
| **Auth & Security** | User Management (Admin Portal) | **MISSING** | No endpoints or UI to create, deactivate, search, or assign roles to portal users |
| **Auth & Security** | RBAC Enforcement | **PARTIALLY IMPLEMENTED**| Backend enforces roles on `/api/v1/actions` and `/api/v1/system`, but no user admin RBAC |
| **AI Subsystem** | JEV Decision Integration | **PARTIALLY IMPLEMENTED**| `JevDecisionService.java` exists, but `fleetiq.jev.enabled=false` by default |
| **AI Subsystem** | JEV Runtime Inference | **NOT VERIFIED / MOCK**| No valid `JEV_API_KEY` provided. Fallback to `RuleBasedDecisionService` is active |
| **AI Subsystem** | TypeSpace AI Integration | **MISSING** | 0 occurrences of TypeSpace in repository |
| **AI Subsystem** | External LLM for Copilot | **MISSING** | `AiAssistantService.java` does not call any external LLM (OpenAI, Gemini, etc.) |
| **AI Subsystem** | Copilot Reasoning Engine | **DEMO / DETERMINISTIC**| Regex pattern matching + database lookups + keyword search. Returns `DETERMINISTIC_GROUNDED` |
| **AI Subsystem** | RAG Architecture | **PARTIALLY IMPLEMENTED**| `RagIndexer.java` and `RagService.java` index local Markdown files via in-memory keyword scoring |
| **AI Subsystem** | Vector Embeddings / Vector DB | **MISSING** | No vector embeddings (OpenAI, HuggingFace) or vector store (pgvector, Pinecone, Qdrant) |
| **Frontend** | Operations Dashboard | **IMPLEMENTED** | Vite + React 18 + TypeScript + Tailwind CSS |
| **Frontend** | Priority Action Center | **IMPLEMENTED** | Action cards with status mutation, priority sorting, and impact breakdown |
| **Frontend** | Vehicle Catalog & Telemetry Modal | **IMPLEMENTED** | Paginated table with search, OEM badges, and telemetry inspection modal |
| **Frontend** | AI Copilot Interface | **DEMO (SIDE MODAL)** | Implemented as modal (`AiAssistantModal.tsx`); needs dedicated `/intelligence/copilot` page |
| **Frontend** | AI Conversation Persistence | **MISSING** | Assistant state is local React state in modal, lost on close/refresh |
| **Frontend** | Distracting Glow / Light Animations | **DEMO UI** | 3D Glowing Orb (`animate-orb`), blue drop-shadows in `index.css` & `RightSidebarWidgets.tsx` |
| **Frontend** | Public System Pages | **MISSING** | No dedicated 404, 401/403, 500 error pages, or public Landing/Login routes |
| **Frontend** | Legal & Compliance Pages | **MISSING** | No `/terms`, `/privacy`, `/cookies`, or `/security` pages |
| **Dev & DevOps** | Docker Containerization | **IMPLEMENTED** | Multi-stage `backend/Dockerfile` and `frontend/Dockerfile` |
| **Dev & DevOps** | Docker Compose Local Stack | **IMPLEMENTED** | `docker-compose.yml` orchestrates PostgreSQL, backend, and frontend |
| **Dev & DevOps** | Dev Container (`.devcontainer`) | **MISSING** | No `.devcontainer/devcontainer.json` for reproducible VS Code / Codespaces setup |
| **Dev & DevOps** | CI/CD GitHub Workflows | **MISSING** | No `.github/workflows/` directory found |
| **Dev & DevOps** | Operational Runbooks | **PARTIALLY IMPLEMENTED**| Preliminary runbooks in `docs/runbooks/` and `.agent/RUNBOOK.md` |
| **Observability** | Prometheus / Grafana Exporter | **MISSING** | Tracing bridge exists, but no OTLP exporter configured for external collector |

---

## 2. Deep Dive: AI, JEV, & RAG Verification

### A. JEV / TypeSpace AI Findings
1. **TypeSpace**: Completely absent from the codebase. No references in Java, TypeScript, JSON, or YAML.
2. **JEV Implementation**:
   - `JevDecisionService.java` is implemented in `com.fleetiq.service.decision`.
   - It evaluates events by preparing an HTTP POST to `https://api.jev.ai/v1/decisions`.
   - **Runtime Reality**: In `application.yml`, `fleetiq.jev.enabled: ${JEV_API_ENABLED:false}` and `fleetiq.jev.api-key: ${JEV_API_KEY:}`. Because `JEV_API_KEY` is not provided in the environment, `JevDecisionService` automatically triggers:
     ```java
     // If Jev AI is disabled, or API key is not configured, gracefully use rule engine fallback
     log.debug("Jev AI is not enabled or API key is missing. Delegating to RuleBasedDecisionService fallback.");
     return ruleBasedDecisionService.evaluate(event, estimatedImpact);
     ```
   - **Conclusion**: *Real JEV inference cannot be verified because no valid provider credential or active configuration is available in this environment. The platform functions 100% deterministically via `RuleBasedDecisionService`.*

### B. AI Copilot / Grounded Assistant Findings
1. **Execution Path**:
   - User types question in `AiAssistantModal.tsx` -> invokes `POST /api/v1/assistant/query` -> handled by `AiAssistantService.processQuestion(question)`.
2. **Logic Inside `AiAssistantService`**:
   - Does NOT connect to any external LLM API (OpenAI, Claude, Gemini, or JEV).
   - Extracts vehicle IDs using regex `\b(VH-\d{4}|VH-[A-Z0-9]+)\b` and fault codes using `\b(P\d{4}|C\d{4}|...)\b`.
   - Executes JPA queries against `vehicleRepository`, `actionRepository`, `eventRepository`.
   - Calls `ragService.retrieveRelevantChunks(query, topK)`.
   - Returns a structured string with `model: "DETERMINISTIC_GROUNDED"`.
3. **Conclusion**: *The "Grounded AI" is currently a deterministic hybrid query synthesizer. It is reliable and grounded in live database state, but does not use an actual LLM. If external LLM reasoning is desired, a vendor-neutral `AIModelProvider` abstraction must be introduced.*

---

## 3. Deep Dive: Authentication & Security

1. **Current Security Boundary**:
   - Spring Security enforces JWT Bearer tokens on protected REST endpoints.
   - External OEM ingestion requires `X-API-Key: fleetiq-ingest-secure-key-2026` or admin credentials.
2. **Security Vulnerabilities & Gaps**:
   - **Frontend Auto-Login**: `AuthContext.tsx` contains hardcoded credentials for 4 roles (`admin`, `ops_lead`, `operator`, `viewer`) and automatically logs the user in as `ops_lead` without any login page.
   - **Missing User Administration**: No API or UI exists to invite, create, deactivate, or change roles of users. All accounts are fixed in `DataInitializer.java`.
   - **Rate Limiting Absent**: Brute-force attacks against `/api/v1/auth/login` and volumetric DoS on `/api/v1/events/ingest` are currently unmitigated.
   - **Error Handling Leakage**: In the absence of a global `@ControllerAdvice`, uncaught runtime exceptions could expose internal stack traces.

---

## 4. Deep Dive: Frontend & User Experience

1. **AI Copilot Experience**:
   - Currently rendered inside `AiAssistantModal.tsx` as a popover dialog.
   - Does not have persistent conversation history, message editing, renaming, or per-user isolation.
   - The user requested a full-page, ChatGPT-style interface at a dedicated route with persistent history.
2. **Distracting Visual Elements**:
   - `RightSidebarWidgets.tsx` and `index.css` contain a 3D animated blue glowing orb (`animate-orb`, `glow-blue`, `drop-shadow`).
   - The user explicitly requested removing this blue light / radio animation to maintain a professional, restrained enterprise UI.
3. **Public & System Surface**:
   - The frontend lacks formal routing (no `react-router`), running as a single-page state machine in `App.tsx`.
   - Missing 404, 401, 403, 500 error pages, and legal pages (`/terms`, `/privacy`, `/cookies`, `/security`).

---

## 5. Audit Conclusion & Phase Transition

The platform has solid foundational domain engineering (Flyway migrations, multi-OEM adapters, deterministic business rules, OpenTelemetry distributed tracing). However, to transition from a prototype into an enterprise product ready for company handover, the gaps identified above must be resolved systematically across security, architecture, user management, dedicated AI experience, and operational documentation.
