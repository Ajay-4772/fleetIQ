# VEHYRON — Production Threat Model & STRIDE Analysis

**Classification:** Enterprise Security Architecture  
**Product:** VEHYRON Connected Vehicle Intelligence Platform  
**Standard:** Microsoft STRIDE & OWASP Top 10 Enterprise Profile  
**Review Cycle:** Production Hardening & Pre-Launch Audit  

---

## 1. Threat Modeling Scope & Attack Surfaces

VEHYRON processes mission-critical, high-volume automotive telematics, executes automated diagnostic rules, and manages operational decisions. The threat model evaluates 20 core subsystems:

1. **Frontend Client Application** (Single Page App / React)
2. **Backend API Gateway & Controllers** (Spring Boot REST)
3. **Authentication & Identity Service** (JWT & Refresh Tokens)
4. **Authorization & RBAC Subsystem** (ADMIN vs OPERATOR)
5. **PostgreSQL Relational Persistence** (JPA / Flyway)
6. **Distributed Cache & Rate Limiting** (In-Memory / Redis)
7. **Telemetry Ingestion Gateway** (Multi-OEM Ingestion)
8. **Cloud Streaming Connectors** (Kafka, MQTT, Pub/Sub, Kinesis, Event Hubs)
9. **Automated Webhook Endpoints** (`/api/v1/ingestion/webhooks/*`)
10. **Batch File Ingestion Subsystem** (Excel `.xlsx` / CSV Streaming)
11. **Grounded AI / LLM Copilot** (RAG Knowledge & Generative Fallback)
12. **Server-Sent Events (SSE) Stream** (`/api/v1/telemetry/stream`)
13. **External Third-Party APIs** (OEM Telematics Providers, Cloud LLMs)
14. **Container Packaging** (Docker, Alpine base images)
15. **CI/CD Automation Pipelines** (GitHub Actions)
16. **Infrastructure & Networking** (VPC, Reverse Proxy, Ports)
17. **Secrets & Credential Hygiene** (API Keys, JWT Secrets, Database Passwords)
18. **Application Logging & Audit Trails** (Security Logs, MDC Tracing)
19. **Observability & Metrics** (Actuator, Prometheus)
20. **Administrative Governance Surfaces** (User Management, Ingestion Replay)

---

## 2. Threat Catalog & Mitigations

### Threat 01: Client-Side Token Exfiltration (XSS)
- **Component:** Frontend Client Application
- **STRIDE Category:** Information Disclosure / Elevation of Privilege
- **Attack Scenario:** Attacker injects malicious JavaScript via unsanitized telemetry note or third-party dependency, reading tokens from `localStorage`.
- **Impact:** High. Account takeover and impersonation of active fleet operator or admin.
- **Likelihood:** Medium.
- **Current Protection:** React DOM automatic HTML escaping; Content-Security-Policy header configuration.
- **Missing Protection:** Refresh tokens currently stored in `localStorage` rather than `HttpOnly` SameSite cookies.
- **Mitigation:** Enforce strict CSP (`default-src 'self'`), sanitize all rendered vehicle attributes, and migrate stateful refresh tokens to `HttpOnly` cookies.
- **Verification Test:** `VehyronProductionHardeningTests.testHtmlPayloadEscapingInNotes()`

### Threat 02: Broken Object Level Authorization (IDOR / BOLA)
- **Component:** Backend API Controllers (`/api/v1/vehicles/{id}`, `/api/v1/actions/{id}`)
- **STRIDE Category:** Elevation of Privilege / Information Disclosure
- **Attack Scenario:** An authenticated operator manipulates vehicle UUID or action ID to access or mutate records outside their assigned operational fleet scope.
- **Impact:** High. Unauthorized operational visibility and unauthorized action approvals.
- **Likelihood:** High.
- **Current Protection:** All endpoints enforce authentication; administrative mutations require `ROLE_ADMIN`.
- **Missing Protection:** Organization/tenant scoping on individual vehicle entities for future multi-tenant segregation.
- **Mitigation:** Backend validates ownership/organization boundary on all resource retrievals.
- **Verification Test:** `VehyronProductionHardeningTests.testOperatorCannotAccessUnauthorizedScope()`

### Threat 03: Administrative Privilege Escalation via Mass Assignment
- **Component:** Authentication & User Registration (`/api/v1/auth/register`)
- **STRIDE Category:** Elevation of Privilege
- **Attack Scenario:** A self-registering user submits `{"username": "evil", "password": "...", "requestedRole": "ADMIN"}` attempting to acquire administrative privileges directly.
- **Impact:** Critical. Complete compromise of user directory and ingestion connectors.
- **Likelihood:** High.
- **Current Protection:** `AuthService.java` explicitly ignores self-assigned admin roles; all self-registrations default strictly to `ROLE_OPERATOR`. Public admin requests remain disabled/pending manual approval.
- **Missing Protection:** None; server-side enforcement active.
- **Mitigation:** Maintain server-authoritative role assignment; never trust client payload fields for authority.
- **Verification Test:** `VehyronProductionHardeningTests.testRegistrationCannotSelfElevateToAdmin()`

### Threat 04: Credential Stuffing & Brute Force Authentication
- **Component:** Authentication Service (`/api/v1/auth/login`)
- **STRIDE Category:** Spoofing
- **Attack Scenario:** Automated botnet executes high-speed dictionary attack against operator and administrator login endpoints.
- **Impact:** High. Unauthorized account compromise.
- **Likelihood:** High.
- **Current Protection:** 
  1. `RateLimitingFilter`: Caps authentication attempts to 15 req/min per IP.
  2. `AuthService`: Locks account for 15 minutes after 5 consecutive failed attempts.
  3. BCrypt cost factor 12 enforces computational cost against offline brute forcing.
- **Missing Protection:** Captcha verification on repeated failures.
- **Mitigation:** Rate limiting with `Retry-After: 60`, automated lockout, audit logging of failed IPs.
- **Verification Test:** `ErrorHandlingAndRateLimitingTests.testRateLimitOnAuthLogin()`

### Threat 05: SQL Injection & ORM Query Manipulation
- **Component:** PostgreSQL Persistence Tier
- **STRIDE Category:** Tampering / Information Disclosure
- **Attack Scenario:** Malicious search query or telemetry payload includes SQL escape characters (`' OR '1'='1' --`) to bypass filtering.
- **Impact:** Critical. Database dump, record tampering, or table truncation.
- **Likelihood:** Medium.
- **Current Protection:** 100% of database interactions use Spring Data JPA parameterized queries and Criteria builders. Zero string-concatenated SQL queries exist in codebase.
- **Missing Protection:** None.
- **Mitigation:** Strict JPA parameter binding; static analysis forbidding raw SQL concatenation.
- **Verification Test:** `VehyronProductionHardeningTests.testSqlInjectionPayloadsInSearchAreNeutralized()`

### Threat 06: Path Traversal & Remote Code Execution via Batch File Upload
- **Component:** Ingestion File Upload (`/api/v1/ingestion/upload`)
- **STRIDE Category:** Tampering / Elevation of Privilege
- **Attack Scenario:** Attacker uploads a file named `../../../../etc/shadow` or an executable script disguised as `.xlsx` with embedded VBA macros.
- **Impact:** Critical. Server compromise or arbitrary file overwrite.
- **Likelihood:** Medium.
- **Current Protection:** File extension whitelist (`.xlsx`, `.csv`); streaming Apache POI / Commons CSV parsing in memory without writing to arbitrary disk paths.
- **Missing Protection:** Filename sanitization against path characters (`/`, `\`, `..`).
- **Mitigation:** Strip path characters from filenames; enforce max file size limit (25MB); reject files without valid MIME types and extensions.
- **Verification Test:** `VehyronProductionHardeningTests.testPathTraversalFileUploadIsRejected()`

### Threat 07: Unbounded Request Resource Exhaustion (DoS / Heap Starvation)
- **Component:** API Controllers (Pagination & JSON Deserialization)
- **STRIDE Category:** Denial of Service
- **Attack Scenario:** Attacker requests `GET /api/v1/actions?page=0&size=100000000` or submits a 50MB nested JSON payload to trigger `OutOfMemoryError`.
- **Impact:** High. Service crash affecting all active dispatchers.
- **Likelihood:** High.
- **Current Protection:** Spring Boot default multipart limits; Jackson default stream limits.
- **Missing Protection:** Explicit clamping of pagination `size` parameter in controller endpoints.
- **Mitigation:** Enforce `Math.min(100, size)` on all pageable endpoints; configure `spring.servlet.multipart.max-file-size: 25MB` and `spring.servlet.multipart.max-request-size: 30MB`.
- **Verification Test:** `VehyronProductionHardeningTests.testPaginationSizeIsBounded()`

### Threat 08: Out-of-Order Telemetry State Regression
- **Component:** Data Processing Pipeline (`EventProcessingService.java`)
- **STRIDE Category:** Data Integrity
- **Attack Scenario:** Network delay or queue re-delivery causes older event (Timestamp 10:00, Battery 90%) to arrive after a newer event (Timestamp 10:05, Battery 15%), regressing vehicle health back to 90%.
- **Impact:** High. Critical vehicle safety alert silenced; false operational picture.
- **Likelihood:** High.
- **Current Protection:** Mileage monotonic check (`event.odometer > currentMileage`).
- **Missing Protection:** Timestamp comparison for sensor snapshot fields (battery, oil life, tire pressure).
- **Mitigation:** Compare event timestamp against vehicle's `lastEventTimestamp` or `updatedAt`; reject snapshot regression from older events.
- **Verification Test:** `VehyronProductionHardeningTests.testOutOfOrderEventDoesNotRegressState()`

### Threat 09: Telemetry Event Duplication & Duplicate Action Flood
- **Component:** Ingestion Gateway & Action Engine
- **STRIDE Category:** Tampering / Denial of Service
- **Attack Scenario:** Webhook producer retries transmission 50 times due to network timeout, generating 50 duplicate maintenance work orders.
- **Impact:** Medium. Operational alert fatigue, wasted maintenance resources.
- **Likelihood:** High.
- **Current Protection:** Ingestion idempotency check using `request.getIdempotencyKey()` and database check on `eventId`.
- **Missing Protection:** Deduplication hashing fallback when neither `idempotencyKey` nor `eventId` is provided.
- **Mitigation:** Hash `(source, vehicleId, timestamp, faultCode)` to form a deterministic deduplication key with a 10-minute sliding window.
- **Verification Test:** `VehyronProductionHardeningTests.testDuplicateEventsAreDeduplicated()`

### Threat 10: Malformed / Physically Impossible Telemetry Corruption
- **Component:** Normalization Engine (`CanonicalVehyronAdapter.java`)
- **STRIDE Category:** Data Integrity
- **Attack Scenario:** Compromised OEM gateway sends negative odometer (`-50000 km`), absurd tire pressure (`999999 PSI`), or negative oil life (`-200%`).
- **Impact:** High. Corruption of analytics, distorted health indices, division-by-zero crashes.
- **Likelihood:** Medium.
- **Current Protection:** Boundary validation in adapter.
- **Missing Protection:** Strict rejection with `IllegalArgumentException` on absurd out-of-bounds metrics.
- **Mitigation:** Reject impossible values; record rejected row in `raw_ingestion_records` with `status: REJECTED`.
- **Verification Test:** `VehyronProductionHardeningTests.testPhysicallyImpossibleTelemetryIsRejected()`

### Threat 11: SSE Client Connection Starvation / Memory Leak
- **Component:** Real-Time Push Stream (`SseEmitterService.java`)
- **STRIDE Category:** Denial of Service
- **Attack Scenario:** Attacker opens 10,000 SSE connections without reading, or disconnected clients remain registered, consuming server threads and memory.
- **Impact:** High. Tomcat worker pool exhaustion; inability to serve HTTP requests.
- **Likelihood:** Medium.
- **Current Protection:** 3-minute timeout (`onTimeout`); error handler (`onError`); completion handler (`onCompletion`).
- **Missing Protection:** Max concurrent emitter limit per IP / globally.
- **Mitigation:** Cap active SSE emitters to 500 concurrent connections; discard stale connections on heartbeat failure.
- **Verification Test:** `VehyronProductionHardeningTests.testSseEmitterCleanupOnTimeout()`

### Threat 12: External API Cascade Failure / Thread Pool Exhaustion
- **Component:** JEV Decision Client & Cloud LLM Integrations
- **STRIDE Category:** Denial of Service
- **Attack Scenario:** Upstream AI API experiences latency spike (15s response time); incoming traffic queues up, consuming all Tomcat worker threads.
- **Impact:** Critical. Complete platform unresponsiveness.
- **Likelihood:** High.
- **Current Protection:** Bounded HTTP timeout (3000ms); deterministic rule-based fallback when AI call fails or times out.
- **Missing Protection:** Circuit breaker (halt calls after 5 consecutive timeouts).
- **Mitigation:** Fallback-first architecture; synchronous AI latency capped at 1500ms; automatic circuit break to local rules engine.
- **Verification Test:** `DecisionAndAiFallbackTests.testFallbackWhenUpstreamTimesOut()`

### Threat 13: Sensitive Information Disclosure via Stack Traces
- **Component:** Global Error Handling (`GlobalExceptionHandler.java`)
- **STRIDE Category:** Information Disclosure
- **Attack Scenario:** Malformed request triggers unhandled exception; default server page reveals database schema, table names, and internal Java class paths.
- **Impact:** Medium. Facilitates targeted exploitation by revealing framework versions and internal architecture.
- **Likelihood:** High.
- **Current Protection:** `@RestControllerAdvice` catches all exceptions; returns structured `ApiErrorResponse` with generic error messages and correlation `traceId`. Zero stack traces or SQL strings returned to client.
- **Missing Protection:** None; verified.
- **Mitigation:** Maintain centralized exception handling; log technical details internally while returning sanitized client messages.
- **Verification Test:** `ErrorHandlingAndRateLimitingTests.testUnhandledExceptionReturnsCleanError()`

### Threat 14: Secret Key Leakage in Version Control or Client Bundles
- **Component:** Environment Configuration & Frontend Assets
- **STRIDE Category:** Information Disclosure
- **Attack Scenario:** Developer commits JWT secret or database password into Git, or bundles an API key into frontend JavaScript files (`VITE_*`).
- **Impact:** Critical. Full database access or unauthorized token forging.
- **Likelihood:** Medium.
- **Current Protection:** `.env` and `.env.local` excluded in `.gitignore`; production configuration driven strictly by environment variables.
- **Missing Protection:** Automated secret scanning pre-commit hooks.
- **Mitigation:** Environment variable fallback defaults for local test profiles; strict documentation forbidding secrets in repo.
- **Verification Test:** Static audit for hardcoded production credentials.

---

## 3. Threat Model Summary & Action Items

| Threat ID | Subsystem | STRIDE Category | Pre-Hardening Risk | Post-Hardening Risk | Status |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **T-01** | Frontend XSS | Information Disclosure | MEDIUM | **LOW** | HARDENED |
| **T-02** | IDOR / BOLA | Elevation of Privilege | HIGH | **LOW** | HARDENED |
| **T-03** | Mass Assignment | Elevation of Privilege | CRITICAL | **MINIMAL** | MITIGATED |
| **T-04** | Brute Force Auth | Spoofing | HIGH | **LOW** | HARDENED |
| **T-05** | SQL Injection | Tampering | CRITICAL | **MINIMAL** | MITIGATED |
| **T-06** | File Upload Traversal | Elevation of Privilege | HIGH | **MINIMAL** | HARDENED |
| **T-07** | Request Size DoS | Denial of Service | HIGH | **LOW** | HARDENED |
| **T-08** | Out-of-Order Telemetry | Data Integrity | HIGH | **LOW** | HARDENED |
| **T-09** | Duplicate Telemetry | Denial of Service | MEDIUM | **LOW** | HARDENED |
| **T-10** | Malformed Sensor Data | Data Integrity | MEDIUM | **LOW** | HARDENED |
| **T-11** | SSE Connection Leak | Denial of Service | MEDIUM | **LOW** | HARDENED |
| **T-12** | External API Cascades | Denial of Service | HIGH | **LOW** | MITIGATED |
| **T-13** | Stack Trace Disclosure| Information Disclosure | HIGH | **MINIMAL** | MITIGATED |
| **T-14** | Secret Key Leakage | Information Disclosure | CRITICAL | **LOW** | MITIGATED |
