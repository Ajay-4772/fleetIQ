# FleetIQ — Architecture Knowledge Base

**Verification Date**: September 25, 2026  
**Status**: Verified against active codebase and AST graph (7,774+ nodes, 15,735+ edges).

---

## 1. System Overview
FleetIQ is a high-reliability connected vehicle intelligence and decision-engineering platform. It ingests multi-OEM telemetry (Tesla, Ford, BMW, Toyota), normalizes disparate schemas into a canonical domain model, detects faults, computes business/safety impact, evaluates automated action recommendations through an AI decision engine with deterministic rules fallback, enforces enterprise RBAC with real-time zero-trust authorization, and streams updates to an operations UI via Server-Sent Events (SSE).

```
[OEM Telemetry / Simulator] 
           │
           ▼
[Normalization Layer (OemAdapter)] ───► [CanonicalVehicleEvent]
                                                 │
                                                 ▼
[Detection & Impact Services] ────────► [DecisionService Abstraction]
                                                 │
                                     ┌───────────┴───────────┐
                                     ▼                       ▼
                           [JevDecisionService]   [RuleBasedDecisionService]
                           (AI Cloud API)         (Deterministic Fallback)
                                     │                       │
                                     └───────────┬───────────┘
                                                 │
                                                 ▼
                                           [ActionItem]
                                                 │
                                                 ├────────► [PostgreSQL / H2]
                                                 │
                                                 ▼
                                     [SSE Broadcasting Service]
                                                 │
                                                 ▼
                                      [React Operations UI]
```

---

## 2. Module Structure
- `backend/`: Spring Boot 3.3.2 application managing ingestion, normalization, business rules, AI abstraction, database persistence, security, and SSE streaming.
  - `src/main/java/com/fleetiq/`:
    - `config/`: Spring security configuration, Jackson object mappers, Actuator configuration.
    - `controller/`: REST endpoints for authentication (`AuthController`), admin user management (`AdminUserController`), actions, dashboard metrics, exports, fleet queries, and simulator.
    - `dto/`: Data transfer objects for auth requests/responses (`RegisterRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `RefreshTokenRequest`, `AuthTokensResponse`), metrics, and fleet data.
    - `model/`: JPA entities (`Vehicle`, `CanonicalVehicleEvent`, `ActionItem`, `Decision`, `User`, `Role`, `RefreshToken`, `PasswordResetToken`, `UserAuditLog`, `ChatConversation`, `ChatMessage`, `RawIngestionRecord`).
    - `repository/`: Spring Data JPA repositories with custom derived and JPQL queries.
    - `security/`: `JwtAuthenticationFilter` (per-request DB validation for 0-second role updates), `JwtTokenProvider`, `RateLimitingFilter`, `PasswordPolicyValidator`, `ApiKeyAuthenticationFilter`.
    - `service/`:
      - `auth/`: `AuthService` (dual-token lifecycle, lockout tracking, token rotation, single-use reset tokens).
      - `action/`: Priority action creation, score calculation, and status progression.
      - `assistant/`: Grounded fleet copilot query processor.
      - `dashboard/`: KPI aggregations, health statistics, and trend analysis.
      - `decision/`: AI decision abstraction and fallback implementations.
      - `detection/`: Anomaly and diagnostic fault code evaluator.
      - `impact/`: Maintenance cost, downtime, and safety risk quantification.
      - `normalization/`: Multi-OEM adapters translating raw payloads to canonical events.
      - `query/`: Natural language intent routing and fleet status queries.
      - `rag/`: Hybrid document + live database retrieval service.
      - `simulator/`: Deterministic synthetic event generator.
      - `sse/`: Thread-safe Server-Sent Events client management and broadcasting.
- `frontend/`: Single-page application built with Vite, React 18, and TypeScript.
  - `src/components/`: Priority action center, fleet overview, live telemetry panel, dedicated full-page AI copilot workspace, admin user management panel, system status pages, and enterprise authentication pages (`LoginPage.tsx`).
  - `src/services/`: API client services with dual-token authentication handling (`api.ts`), auto-refresh interceptors, and SSE event listeners.
- `docker-compose.yml`: Multi-container configuration orchestrating PostgreSQL database and services.

---

## 3. Domain Boundaries
- **Security & Authorization Boundary**: Identity, token issuance, and server-side RBAC are fully encapsulated in `security/` and `service/auth/`. No downstream service relies on client-provided claims; authorities are resolved from the database per-request.
- **Ingestion Boundary**: Isolate OEM-specific payload eccentricities. Adapters (`TeslaEvAdapter`, `FordAdapter`, `BmwAdapter`, `ToyotaAdapter`) implement `OemAdapter`, mapping to `CanonicalVehicleEvent`. Downstream layers never access raw OEM formats.
- **Decision Engine Boundary**: The decision logic is completely encapsulated behind `DecisionService`. Callers request an evaluation for a vehicle event without knowing whether it is fulfilled by an external AI API or local deterministic heuristics.
- **Action Lifecycle Boundary**: `ActionItem` encapsulates operational state (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`) and priority scores, decoupled from how the underlying fault was detected.
- **Assistant Boundary**: The AI assistant strictly consumes pre-filtered context generated by `RagService` and `FleetQueryService`, preventing ungrounded model output.

---

## 4. Application Layers
1. **Security & Ingestion Layer**:
   - `JwtAuthenticationFilter`: Validates Bearer tokens on protected REST APIs and re-verifies user active status and authorities against DB in real-time.
   - `RateLimitingFilter`: Tiered token-bucket rate limiting (15 req/min on auth, 40 on AI, 300 on telemetry, 600 general).
   - `ApiKeyAuthenticationFilter`: Validates ingestion keys on high-throughput telemetry endpoints.
2. **Controller Layer**:
   - Exposes RESTful endpoints under `/api/v1/`.
   - Validates request payloads with `@Valid` and Jakarta validation annotations.
   - Enforces method-level RBAC via `@PreAuthorize`.
3. **Service Layer**:
   - Contains business logic, normalization, decision routing, impact calculation, and event broadcasting.
   - Transaction boundaries managed via Spring `@Transactional`.
4. **Persistence Layer**:
   - Spring Data JPA repositories with query indexing for VIN, timestamps, and priority levels.
5. **Database Tier**:
   - Managed via Flyway migrations (`V1__initial_schema.sql`, `V2__user_audit_and_copilot_chat.sql`, `V3__auth_tokens_and_user_lifecycle.sql`).
   - In-memory H2 (PostgreSQL compatibility mode) for unit and integration testing.
   - PostgreSQL 16 for production deployments.

---

## 5. Database Architecture
### Core Entities & Relationships
- **User**: Authentication & identity record (`id`, `username`, `email`, `password_hash`, `role`, `enabled`, `email_verified`, `last_login_at`, `failed_attempts`, `locked_until`, `organization`, `created_at`, `updated_at`).
- **RefreshToken**: Rotatable 7-day session token (`id`, `user_id`, `token`, `expires_at`, `revoked`, `created_at`).
- **PasswordResetToken**: Single-use 1-hour reset token (`id`, `user_id`, `token`, `expires_at`, `used`, `created_at`).
- **UserAuditLog**: Tamper-evident security audit trail (`id`, `user_id`, `actor_username`, `action`, `details`, `ip_address`, `timestamp`).
- **Vehicle**: Master fleet record (`vin`, `make`, `model`, `year`, `powertrainType`, `status`, `currentOdometerKm`, `batteryLevelPct`, `fuelLevelPct`, `lastSeen`).
- **CanonicalVehicleEvent**: Normalized telemetry record (`id`, `eventId`, `vin`, `oem`, `source`, `timestamp`, `eventType`, `severity`, etc.).
- **Decision**: AI / rule evaluation output (`id`, `decisionId`, `vin`, `eventId`, `recommendedAction`, `decisionSource`, `confidenceScore`, etc.).
- **ActionItem**: Operator work item (`id`, `actionId`, `vin`, `oem`, `title`, `description`, `actionType`, `priority`, `status`, `estimatedCostUsd`, etc.).
- **ChatConversation** & **ChatMessage**: Persistent multi-turn AI Copilot conversational state.

---

## 6. Real-Time RBAC & Event Flow
1. User logs in via `POST /api/v1/auth/login`. System verifies BCrypt hash, checks lockout, issues 15-min JWT access token + 7-day DB refresh token.
2. On every protected request, `JwtAuthenticationFilter` validates signature and queries `UserRepository.findByUsername()`.
3. If admin demotes or deactivates the user in PostgreSQL, the very next request evaluates the updated state:
   - If disabled: Rejected immediately with `401 Unauthorized`.
   - If role changed: Evaluates with new role authority (e.g. `ROLE_OPERATOR` -> `ROLE_VIEWER` cannot patch action items).
4. Telemetry is received via `/api/v1/simulator/generate` or incoming OEM webhook.
5. `NormalizationService` identifies OEM and delegates to appropriate `OemAdapter`.
6. `CanonicalVehicleEvent` is constructed and persisted to the database.
7. `DetectionService` checks for critical DTCs or out-of-band telemetry thresholds.
8. `ImpactService` estimates projected financial impact ($USD) and downtime.
9. `HybridDecisionService` queries AI with deterministic fallback.
10. `ActionService` creates an `ActionItem` with calculated priority score.
11. `SseService` dispatches live updates to connected operations consoles.

---

## 7. Testing Architecture
- JUnit 5 + Mockito 5 + Spring Boot Starter Test.
- Fast, isolated integration and security test suites:
  - `AuthenticationAndSessionTests` (13 tests verifying login, lockout, tokens, reset, deactivation, and real-time RBAC).
  - `AdminUserAndRbacTests` (5 tests).
  - `SecurityAndAuthTests` (6 tests).
  - Plus 10 other domain test suites totaling 73/73 passing tests.

---

## 8. Observability Architecture
- **Actuator**: Endpoints at `/actuator/health`, `/actuator/metrics`, `/actuator/info`.
- **Distributed Tracing**: OpenTelemetry tracing via `micrometer-tracing-bridge-otel` with W3C `traceparent` propagation and MDC correlation in `TraceResponseFilter`.
- **Structured Logging**: Logback with MDC `traceId` and `spanId` on all application logs.
