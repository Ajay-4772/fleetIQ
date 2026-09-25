# FleetIQ — Security Engineering & Hardening

**Security Baseline**: Production Grade  
**Authentication Standard**: Stateless JWT (HMAC-SHA256) + Ingestion API Key  
**Access Control**: Role-Based Access Control (RBAC) via Spring Security 6

---

## 1. Authentication Architecture
- **User Authentication**:
  - `POST /api/v1/auth/login`: Issues signed JWT upon valid credential verification.
  - Signed using minimum 256-bit secret (`JWT_SECRET`).
  - Tokens expire after configured window (`JWT_EXPIRATION_MS`, default 24 hours).
  - Validated on each request by `JwtAuthenticationFilter`.
- **Machine / Ingestion Authentication**:
  - OEM telemetry ingestion and high-frequency webhook endpoints accept an ingestion API key (`X-API-KEY` or `FLEETIQ_INGESTION_API_KEY`).
  - Validated by `ApiKeyAuthenticationFilter`.

---

## 2. Authorization & Least Privilege
- Three distinct roles defined in `com.fleetiq.model.Role`:
  - `ROLE_ADMIN`: Full administrative control, user provisioning, system configuration, simulator load testing.
  - `ROLE_DISPATCHER`: Operational view, action status updates (`PENDING` -> `IN_PROGRESS` -> `RESOLVED`), grounded assistant querying.
  - `ROLE_OPERATOR`: Read-only access to fleet metrics, active vehicle telemetry, and export utilities.
- Method-level protection enforced via `@PreAuthorize("hasRole('ADMIN')")`.

---

## 3. Threat Mitigation & Defensive Practices
1. **SQL Injection Defense**:
   - Zero raw string concatenation in SQL queries.
   - All persistence queries execute via Spring Data JPA derived queries or parameterized JPQL queries with named parameters.
2. **Input Validation & Sanitization**:
   - Controller DTOs annotated with Jakarta Validation (`@NotNull`, `@Size`, `@Pattern`, `@Min`, `@Max`).
   - Vehicle VIN strictly verified against 17-character alphanumeric standard.
3. **Secret Hygiene**:
   - All credentials (`JWT_SECRET`, `DB_PASSWORD`, `JEV_API_KEY`, `FLEETIQ_INGESTION_API_KEY`) loaded from environment variables with safe defaults in dev profile.
   - Production profile (`postgres`) requires explicit container/orchestrator environment variable injection.
4. **API Abuse & DOS Protection**:
   - External AI timeouts bounded (`JEV_TIMEOUT_MS: 3000`) preventing thread starvation.
   - Simulator batch generation bounded by default constraints (`SIMULATOR_DEFAULT_EVENT_COUNT: 100`).
