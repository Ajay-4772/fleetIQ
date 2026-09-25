# FleetIQ — Master Requirements Specification

**Document Version**: 1.0.0  
**Status**: ACTIVE / CANONICAL  
**Last Updated**: September 25, 2026  
**Purpose**: Consolidate every functional and non-functional requirement across all engineering domains, user prompts, and handover contracts into one unified master specification.

---

## 1. Product Requirements
- **PRD-01**: FleetIQ must function as an enterprise-grade connected vehicle intelligence platform providing real-time fleet health monitoring, predictive maintenance alerts, and prioritized operational action directives.
- **PRD-02**: The platform must support multiple commercial automotive and heavy-duty OEMs through decoupled telemetry normalization adapters.
- **PRD-03**: All operational decisions must provide clear financial impact attribution (downtime risk cost, critical failure prevention ROI).
- **PRD-04**: The system must operate reliably 24/7 with zero dependence on experimental AI availability.

## 2. Frontend Requirements
- **FED-01**: Replace the AI Copilot side-modal (`AiAssistantModal.tsx`) with a dedicated, first-class full-page interface (`/intelligence/copilot`).
- **FED-02**: Remove the 3D animated blue glowing orb (`animate-orb`), blue drop-shadows, and pulsating radio glow. Enforce clean, restrained, enterprise visual styling.
- **FED-03**: Support dark/light visual consistency with subtle borders, enterprise typography, clear status badges, and accessible contrast.
- **FED-04**: Provide rich states across all views: Loading skeletons, Empty states (no vehicles, no alerts, no conversations), and Error boundary recovery.

## 3. Backend Requirements
- **BED-01**: Maintain a clean layered architecture: Controllers -> Services -> Repositories -> JPA Entities.
- **BED-02**: Guarantee thread safety and concurrency safety across ingestion pipelines and real-time SSE broadcasts.
- **BED-03**: Ensure zero application logic coupling to IDE tooling or external developer-machine artifacts.
- **BED-04**: Provide vendor-neutral abstractions for AI inference and telemetry streaming.

## 4. Database Requirements
- **DBD-01**: PostgreSQL 15/16 as primary production database; H2 in PostgreSQL compatibility mode for local dev/testing.
- **DBD-02**: Enforce 100% versioned SQL schema migrations via Flyway. Disallow Hibernate `ddl-auto: update` in all profiles (`ddl-auto: validate` mandatory).
- **DBD-03**: Create migration `V2__user_audit_and_copilot_chat.sql` for user audit logging and persistent multi-turn AI conversations.
- **DBD-04**: Ensure all foreign keys, unique constraints, and search indexes (`status`, `vehicle_id`, `created_at`, `priority`) are documented and monitored.

## 5. Authentication Requirements
- **AUT-01**: Eliminate frontend hardcoded credentials and auto-login routines from `AuthContext.tsx`.
- **AUT-02**: Implement a formal Login / Logout authentication flow backed by bcrypt password verification and cryptographically signed JWT tokens.
- **AUT-03**: Support JWT token expiration (24h default) and user account status verification (`enabled: true`).
- **AUT-04**: Separate authentication credentials strictly across Development, Staging, and Production environments via environment variables.

## 6. Authorization & RBAC Requirements
- **RBC-01**: Server-side role enforcement on all API routes via Spring Security `@PreAuthorize` or HTTP security filters.
- **RBC-02**: Standardize roles: `ROLE_ADMIN` (full system & user management), `ROLE_OPERATIONS_LEAD` (simulator, rule configuration, action management), `ROLE_OPERATOR` (action resolution, telemetry ingestion), `ROLE_VIEWER` (read-only queries and copilot).
- **RBC-03**: Ensure frontend role checks only govern UI visibility; backend security filters remain the authoritative security boundary.

## 7. User Management Requirements
- **UMG-01**: Provide dedicated administrative endpoints under `/api/v1/admin/users` restricted to `ROLE_ADMIN`.
- **UMG-02**: Support user operations: list users, search users, create user, deactivate user, reactivate user, and update user role.
- **UMG-03**: Provide administrative audit logging for user status modifications and role changes.

## 8. AI Architecture Requirements
- **AID-01**: Establish `AIModelProvider` vendor abstraction decoupling business logic from external LLM providers.
- **AID-02**: Support active providers: `DeterministicFallbackProvider` (active default), `JevModelProvider` (when credentials available), `GeminiModelProvider` / `OpenAiModelProvider` (extensible).
- **AID-03**: AI must act strictly as an analytical reasoning assistant; AI outputs must never bypass deterministic safety constraints.

## 9. JEV / TypeSpace Verification Requirements
- **JEV-01**: Explicitly record that TypeSpace does NOT exist in the codebase.
- **JEV-02**: Acknowledge that JEV integration is implemented in `JevDecisionService`, but runtime inference is disabled (`JEV_API_ENABLED=false`) and no key is configured.
- **JEV-03**: Clearly document that real JEV calls require company-owned enterprise credentials.

## 10. RAG Architecture Requirements
- **RAG-01**: Clarify RAG purpose: grounding queries in OEM service manuals, diagnostic trouble codes (DTC), and fleet operational SOPs.
- **RAG-02**: Transition in-memory keyword scoring toward clean vector-capable document abstraction with metadata filtering and citations.
- **RAG-03**: Enforce user authorization on retrieved documents; prevent cross-tenant or unauthorized knowledge retrieval.

## 11. Decision Engine Requirements
- **DEC-01**: Maintain the hybrid decision pipeline: Raw Event -> Validation -> Normalization -> Deterministic Rules -> AI Reasoning -> Confidence Validation -> Action Item.
- **DEC-02**: Always record decision provenance (`RULE_ENGINE`, `JEV_AI`, `RULE_ENGINE_FALLBACK`) and confidence scores.
- **DEC-03**: Flag low-confidence (<0.80) or anomalous decisions for mandatory human operator review.

## 12. Security Requirements
- **SEC-01**: Enforce OWASP Top 10 defenses: SQL injection prevention via JPA parameterized queries, XSS sanitization, and strict CORS.
- **SEC-02**: Implement Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **SEC-03**: Never commit secrets, passwords, or private keys to Git. Maintain comprehensive `.gitignore` and `.env.example`.

## 13. API Requirements
- **API-01**: Comprehensive REST API inventory documented in `docs/api/API_INVENTORY.md`.
- **API-02**: Strict separation between public endpoints (`/api/v1/auth/login`, health checks) and authenticated operations endpoints.
- **API-03**: Include distributed trace identifier (`X-Trace-Id`) and correlation ID in all responses.

## 14. Rate Limiting Requirements
- **RAT-01**: Implement rate limiting on sensitive endpoints: `/api/v1/auth/login` (brute-force defense: 5 req/min), `/api/v1/assistant/query` (cost defense: 20 req/min), `/api/v1/events/ingest` (burst defense: 100 req/sec).
- **RAT-02**: Return HTTP 429 Too Many Requests with standard `Retry-After` header when thresholds are exceeded.

## 15. Input Validation Requirements
- **VAL-01**: Enforce Jakarta Bean Validation (`@Valid`, `@NotNull`, `@Size`, `@Pattern`) on all incoming REST request bodies.
- **VAL-02**: Validate VIN formats (17 alphanumeric characters, uppercase, excluding I, O, Q) and diagnostic fault code syntax.
- **VAL-03**: Reject oversized payloads, malformed JSON, and JSON depth attacks before database or service layer processing.

## 16. Error Handling Requirements
- **ERR-01**: Implement global exception handler (`@ControllerAdvice`) returning consistent, sanitized JSON error payloads:
  ```json
  {
    "timestamp": "2026-09-25T12:00:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed for field 'vin'",
    "path": "/api/v1/vehicles",
    "traceId": "00-1234..."
  }
  ```
- **ERR-02**: Never leak raw SQL exceptions, Hibernate stack traces, or internal server paths to API consumers.

## 17. Scalability & Workload Requirements
- **SCA-01**: Document capacity assumptions: 10,000 connected vehicles, 500 events/sec peak ingestion, 50 concurrent operators.
- **SCA-02**: Audit connection pools (HikariCP default: 10 max connections; scale to 50 for production).
- **SCA-03**: Prepare asynchronous worker pool for heavy OEM event ingestion decoupling HTTP thread from persistence and SSE dispatch.

## 18. Load Balancing Requirements
- **LBL-01**: Guarantee backend statelessness: no HTTP session affinity required; all authentication validated via stateless JWT tokens.
- **LBL-02**: Document load balancer deployment (AWS ALB / Nginx reverse proxy) distributing traffic across multiple Spring Boot instances.
- **LBL-03**: Document SSE connection management across multiple instances via Redis pub/sub.

## 19. Performance Requirements
- **PRF-01**: Sub-50ms p95 latency for vehicle lookup and dashboard aggregation endpoints.
- **PRF-02**: Database queries utilizing composite indexes on `(status)`, `(vehicle_id, created_at)`, `(event_type, timestamp)`.

## 20. Docker & Local Stack Requirements
- **DKR-01**: Verified multi-stage Docker builds for backend (Eclipse Temurin JRE 17) and frontend (Nginx Alpine).
- **DKR-02**: `docker-compose.yml` supporting instant single-command spin-up (`docker compose up --build`).
- **DKR-03**: Non-root container security execution where appropriate.

## 21. CI/CD Requirements
- **CIC-01**: Implement GitHub Actions CI pipeline (`.github/workflows/ci.yml`) executing: checkout, JDK 17 setup, Maven clean test, Node 20 setup, npm run build, and Docker build verification.
- **CIC-02**: Pull requests blocked if unit/integration tests fail or static build checks produce errors.

## 22. Git & Engineering Workflow Requirements
- **GIT-01**: Professional branch strategy: `main` (protected production branch), `feature/*`, `bugfix/*`, `refactor/*`, `security/*`.
- **GIT-02**: Semantic commit message convention: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`.
- **GIT-03**: Standard pull request template (`.github/PULL_REQUEST_TEMPLATE.md`) with testing and security checklists.

## 23. Deployment & Infrastructure Requirements
- **DEP-01**: Document multi-environment progression: Development -> Staging -> Production.
- **DEP-02**: Provider-neutral containerized deployment guidelines for AWS ECS/EKS, Azure Container Apps, or GCP Cloud Run.

## 24. Cloud & Provider Independence Requirements
- **CLD-01**: Zero proprietary vendor lock-in. Storage uses standard SQL / S3-compatible interfaces; container runtimes use standard OCI images.

## 25. Monitoring & Observability Requirements
- **MON-01**: Spring Boot Actuator endpoints (`/actuator/health`, `/actuator/metrics`, `/actuator/info`).
- **MON-02**: OpenTelemetry distributed tracing with W3C `traceparent` context propagation across HTTP and SSE streams.
- **MON-03**: Logback MDC correlation formatting logs with `[service,traceId,spanId]`.

## 26. Logging Standards
- **LOG-01**: Structured logging with contextual metadata (VIN, eventId, tenantId).
- **LOG-02**: Zero sensitive credential logging (passwords, JWT secrets, API keys strictly scrubbed).

## 27. Alerting Requirements
- **ALT-01**: Actionable operational alert thresholds defined: high ingestion failure rate (>2%), elevated 5xx error rate (>1%), database connection saturation (>80%).

## 28. Testing Requirements
- **TST-01**: Comprehensive test coverage: Unit tests, Spring Boot integration tests, MockMvc API tests, Flyway migration tests, OpenTelemetry tracing tests.
- **TST-02**: Enforce 100% test pass rate before any release or milestone completion.

## 29. Load Testing Requirements
- **LDT-01**: Load testing strategy defined in `docs/testing/LOAD_TESTING.md` covering baseline API, burst ingestion, and concurrent RAG queries.

## 30. Disaster Recovery Requirements
- **REC-01**: Document PostgreSQL backup strategy, Point-In-Time Recovery (PITR), RPO (<15 minutes), and RTO (<1 hour) in `docs/operations/DISASTER_RECOVERY.md`.

## 31. Documentation Requirements
- **DOC-01**: Complete documentation suite under `docs/` covering architecture, APIs, database, security, operations, testing, runbooks, and company handover.

## 32. Maintenance Workflow Requirements
- **MNT-01**: Standard maintenance lifecycle documented in `docs/development/MAINTENANCE_WORKFLOW.md` (Issue -> Investigation -> Fix -> PR -> Staging -> Prod).

## 33. Company Handover Requirements
- **HND-01**: Complete handover package in `docs/HANDOVER/` covering ownership transfer, credentials separation, billing services, and architecture guides.
- **HND-02**: FleetIQ must be 100% operable and maintainable in VS Code, IntelliJ, and GitHub Codespaces without Antigravity IDE.

## 34. Legal & Compliance Requirements
- **LGL-01**: Create template legal documents: `/terms` (Terms of Service) and `/privacy` (Privacy Policy) marked `LEGAL REVIEW REQUIRED`.
- **LGL-02**: Cookie policy clearly distinguishing mandatory session JWT storage from tracking.

## 35. Accessibility Requirements
- **ACC-01**: Semantic HTML5 elements, keyboard navigation support (Tab / Enter / Esc), screen-reader ARIA attributes, and accessible color contrast.

## 36. SEO & Web Metadata Requirements
- **SEO-01**: Proper HTML `<title>`, `<meta name="description">`, OpenGraph tags on public pages; `robots.txt` forbidding search crawler indexing of private dashboard routes.

## 37. Web Application UX Requirements
- **WUX-01**: Production-grade page layout with header, navigation, notification feedback, responsive layout from 375px mobile to 4K desktop.

## 38. Support & Contact Requirements
- **SUP-01**: Configurable enterprise support and security vulnerability reporting contacts (`docs/security/SECURITY_CONTACT.md`).

## 39. Public System Pages Requirements
- **PSP-01**: Provide dedicated UI routes for: `/` (Landing/Home), `/login` (Secure Authentication), `/404` (Not Found), `/403` (Access Denied), `/500` (Server Error), `/maintenance` (System Maintenance Mode).

## 40. Production Readiness Verification
- **PRV-01**: End-to-end verification checklist ensuring all quality gates, builds, and security scans pass prior to declaring handover readiness.
