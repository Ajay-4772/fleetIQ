# VEHYRON — Production Security Audit Report

**Audit Standard:** OWASP Top 10 (2021) / CWE / SANS Top 25  
**Evaluation Standard:** Zero-Fabrication Codebase Inspection  
**Audit Scope:** Full VEHYRON Repository (Backend, Frontend, Persistence, Ingestion, Containers)  
**Date:** September 26, 2026  

---

## 1. Executive Security Findings Summary

| Finding ID | Vulnerability Category | Severity | Component Affected | Remediation Status |
| :---: | :--- | :---: | :--- | :---: |
| **SEC-01** | Cross-Origin Resource Sharing (CORS) Wildcard | **MEDIUM** | `SecurityConfig.java` | **RESOLVED** |
| **SEC-02** | Missing Standard Security Headers | **LOW** | `SecurityConfig.java` | **RESOLVED** |
| **SEC-03** | Unbounded Pagination Resource Exhaustion | **MEDIUM** | `ActionController.java` | **RESOLVED** |
| **SEC-04** | Out-of-Order Telemetry State Regression | **HIGH** | `EventProcessingService.java` | **RESOLVED** |
| **SEC-05** | Batch File Path Traversal Vulnerability | **HIGH** | `ExcelCsvIngestionService.java`| **RESOLVED** |
| **SEC-06** | Physically Impossible Sensor Range Acceptance | **MEDIUM** | `CanonicalVehyronAdapter.java` | **RESOLVED** |
| **SEC-07** | Administrator Self-Demotion / Lockout | **LOW** | `UserService.java` | **RESOLVED** |
| **SEC-08** | Missing Retry-After Header on HTTP 429 | **LOW** | `RateLimitingFilter.java` | **RESOLVED** |

---

## 2. Detailed Findings, Evidence & Remediations

### SEC-01: Cross-Origin Resource Sharing (CORS) Wildcard with Credentials
- **Finding ID:** SEC-01
- **Category:** A05:2021 – Security Misconfiguration
- **Severity:** **MEDIUM**
- **Affected Component:** `backend/src/main/java/com/fleetiq/security/SecurityConfig.java`
- **Description:** Previously, `corsConfigurationSource()` configured `config.setAllowedOriginPatterns(List.of("*"))` alongside `config.setAllowCredentials(true)`. In production environments, allowing wildcard origin patterns with credentials permits cross-origin requests from arbitrary third-party websites.
- **Impact:** Potential CSRF / credential exposure if an operator browses an untrusted site while authenticated.
- **Evidence:** `SecurityConfig.java:138`: `config.setAllowedOriginPatterns(List.of("*"));`
- **Remediation:** Configured explicit, environment-driven allowed origins via `${CORS_ALLOWED_ORIGINS}` with defaults restricted to `http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173`.
- **Verification Test:** `VehyronProductionHardeningTests.testCorsPolicyDoesNotAllowArbitraryOrigins()`
- **Status:** **RESOLVED**

---

### SEC-02: Missing Standard Defensive Security Headers
- **Finding ID:** SEC-02
- **Category:** A05:2021 – Security Misconfiguration
- **Severity:** **LOW**
- **Affected Component:** `backend/src/main/java/com/fleetiq/security/SecurityConfig.java`
- **Description:** The HTTP response headers did not explicitly set `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, or `Referrer-Policy`.
- **Impact:** Vulnerability to clickjacking, MIME-sniffing attacks, and referrer leakage in older or strict enterprise browsers.
- **Evidence:** `SecurityConfig.java` only disabled frameOptions for H2 console.
- **Remediation:** Added explicit security headers in `SecurityFilterChain`:
  - `Content-Security-Policy: default-src 'self'; frame-ancestors 'self'`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
- **Verification Test:** `VehyronProductionHardeningTests.testSecurityHeadersPresentInResponse()`
- **Status:** **RESOLVED**

---

### SEC-03: Unbounded Pagination Resource Exhaustion
- **Finding ID:** SEC-03
- **Category:** A04:2021 – Insecure Design / Denial of Service
- **Severity:** **MEDIUM**
- **Affected Component:** `backend/src/main/java/com/fleetiq/controller/ActionController.java`
- **Description:** Endpoint `GET /api/v1/actions` accepted user-supplied `page` and `size` parameters directly into `PageRequest.of(page, size)` without upper bounds enforcement. A request specifying `size=1000000` could trigger significant heap allocation and GC pause.
- **Impact:** Denial of service / JVM heap starvation under malicious load.
- **Evidence:** `ActionController.java:29`: `PageRequest.of(page, size)`
- **Remediation:** Clamped `size` parameter strictly between `1` and `100` (`Math.max(1, Math.min(100, size))`) and ensured `page >= 0`.
- **Verification Test:** `VehyronProductionHardeningTests.testPaginationSizeIsBounded()`
- **Status:** **RESOLVED**

---

### SEC-04: Out-of-Order Telemetry State Regression
- **Finding ID:** SEC-04
- **Category:** Data Integrity / Concurrency
- **Severity:** **HIGH**
- **Affected Component:** `backend/src/main/java/com/fleetiq/service/EventProcessingService.java`
- **Description:** Vehicle snapshot attributes (oil life, battery health, tire pressure) were overwritten directly by incoming event attributes without validating if the event was generated prior to the vehicle's currently recorded latest telemetry timestamp. Stale delayed events could revert critical diagnostic states.
- **Impact:** Silent suppression of critical maintenance alarms; corrupted operational telemetry overview.
- **Evidence:** `EventProcessingService.java:176`: `if (event.getOilLifePct() != null) v.setOilLifePct(...)` without timestamp comparison.
- **Remediation:** Added event timestamp ordering check: if `event.getTimestamp()` is strictly before the vehicle's `updatedAt` / `lastEventTimestamp`, the historical event is persisted in `canonical_vehicle_events` but the live vehicle snapshot is protected from regression.
- **Verification Test:** `VehyronProductionHardeningTests.testOutOfOrderEventDoesNotRegressState()`
- **Status:** **RESOLVED**

---

### SEC-05: Batch File Upload Path Traversal Vulnerability
- **Finding ID:** SEC-05
- **Category:** A01:2021 – Broken Access Control / Path Traversal
- **Severity:** **HIGH**
- **Affected Component:** `backend/src/main/java/com/fleetiq/service/ingestion/ExcelCsvIngestionService.java`
- **Description:** Uploaded file names were accepted without stripping directory traversal sequences (`..`, `/`, `\`), and unsupported file types were not rejected with explicit security exceptions prior to processing.
- **Impact:** Potential file upload traversal or resource exhaustion via unauthorized file types.
- **Evidence:** `ExcelCsvIngestionService.java:66`: `String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "dataset.csv";`
- **Remediation:** 
  1. Sanitized filenames by stripping path components and directory traversal characters.
  2. Enforced strict extension whitelist: `.csv`, `.xlsx`, `.xls`. Any other extension immediately throws `IllegalArgumentException`.
  3. Enforced 25MB file size limit and checked `file.isEmpty()`.
- **Verification Test:** `VehyronProductionHardeningTests.testPathTraversalFileUploadIsRejected()`
- **Status:** **RESOLVED**

---

### SEC-06: Physically Impossible Sensor Range Acceptance
- **Finding ID:** SEC-06
- **Category:** Data Integrity / Input Validation
- **Severity:** **MEDIUM**
- **Affected Component:** `backend/src/main/java/com/fleetiq/service/normalization/CanonicalVehyronAdapter.java`
- **Description:** Absurd negative or extreme sensor metrics (e.g. oil life `-500%`, tire pressure `999999 PSI`) were silently clamped rather than rejected as malformed/corrupted telematics.
- **Impact:** Unreliable analytics and distorted health index calculations.
- **Evidence:** `CanonicalVehyronAdapter.java:41`: `oilLife = Math.max(0.0, Math.min(100.0, oilLife));`
- **Remediation:** Throws `IllegalArgumentException` for physically impossible telemetry (`oilLife < 0 || oilLife > 100`, `odometer < 0`, `tirePressure < 0 || tirePressure > 150`, `battery < 0 || battery > 1000`). Failed payloads are recorded in dead-letter table.
- **Verification Test:** `VehyronProductionHardeningTests.testPhysicallyImpossibleTelemetryIsRejected()`
- **Status:** **RESOLVED**

---

### SEC-07: Administrator Self-Demotion / Lockout
- **Finding ID:** SEC-07
- **Category:** Business Logic Security / Access Control
- **Severity:** **LOW**
- **Affected Component:** `backend/src/main/java/com/fleetiq/service/user/UserService.java`
- **Description:** While self-deactivation was blocked, an administrator could update their own role from `ROLE_ADMIN` to `ROLE_OPERATOR`, potentially leaving the system without an accessible active administrator.
- **Impact:** Administrative lockout requiring direct SQL intervention.
- **Evidence:** `UserService.java:101`: `updateUserRole` lacked self-demotion check.
- **Remediation:** Added self-demotion block: `if (user.getUsername().equals(actorUsername) && newRole != Role.ROLE_ADMIN) throw new IllegalArgumentException("Administrators cannot demote their own account role");`.
- **Verification Test:** `VehyronProductionHardeningTests.testAdminCannotDemoteSelf()`
- **Status:** **RESOLVED**

---

### SEC-08: Missing Retry-After Header on HTTP 429 Responses
- **Finding ID:** SEC-08
- **Category:** A04:2021 – Insecure Design / Rate Limiting
- **Severity:** **LOW**
- **Affected Component:** `backend/src/main/java/com/fleetiq/security/RateLimitingFilter.java`
- **Description:** Rate limit responses returned HTTP 429 Too Many Requests but omitted standard RFC 6585 headers `Retry-After: 60` and `X-RateLimit-Remaining: 0`.
- **Impact:** Automated clients had no standard machine-readable guidance on backoff duration.
- **Evidence:** `RateLimitingFilter.java:80` only wrote JSON body without headers.
- **Remediation:** Set `Retry-After: 60`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining: 0` before writing response.
- **Verification Test:** `VehyronProductionHardeningTests.testRateLimitHeadersOn429()`
- **Status:** **RESOLVED**
