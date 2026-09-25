# VEHYRON — Security Engineering & Hardening

**Security Baseline**: Production Grade (Enterprise Fleet Intelligence)  
**Authentication Standard**: Dual-Token (Stateless 15-min HMAC-SHA256 JWT Access Token + Stateful 7-day Rotatable UUID Refresh Token)  
**Access Control**: Server-Side Role-Based Access Control (RBAC) via Spring Security 6 with 0-Second Real-Time Propagation  
**Credential Standard**: BCrypt Cost Factor 12, Strict Complexity Enforcement, 15-Minute Brute-Force Lockout (5 attempts)

---

## 1. Authentication Architecture
- **Dual-Token System**:
  - `POST /api/v1/auth/login`: Issues signed 15-minute access token and persists a 7-day rotatable refresh token in PostgreSQL.
  - `POST /api/v1/auth/refresh`: Exchanges valid refresh token for a new token pair, immediately revoking the previous refresh token.
  - `POST /api/v1/auth/register`: Public onboarding defaulting strictly to `ROLE_VIEWER` and `email_verified = false`.
  - `POST /api/v1/auth/forgot-password` & `/reset-password`: Single-use, 1-hour expiring tokens with cascade session invalidation.
  - `POST /api/v1/auth/logout`: Revokes all active refresh tokens for the caller.
  - `GET /api/v1/auth/me`: Real-time profile and permission retrieval.
- **Machine / Ingestion Authentication**:
  - OEM telemetry ingestion (`/api/v1/telemetry/ingest`) accepts an ingestion API key (`X-API-KEY` or `FLEETIQ_INGESTION_API_KEY`).
  - Validated by `ApiKeyAuthenticationFilter`.

---

## 2. Authorization & Real-Time Zero-Trust RBAC
- **Four Distinct Roles**:
  - `ROLE_ADMIN`: Complete user lifecycle governance, role modification, security audit log access, simulator execution, system health.
  - `ROLE_OPERATIONS_LEAD`: Operational supervision, priority work order status updates (`PENDING` -> `RESOLVED`), telematics analysis.
  - `ROLE_OPERATOR`: Real-time telematics dispatch, vehicle telemetry monitoring, and active fleet tracking.
  - `ROLE_VIEWER`: Strict read-only access to dashboard metrics and vehicle health scores.
- **Method-Level Security**: Enforced via `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAnyRole('OPERATOR', 'OPERATIONS_LEAD', 'ADMIN')")`.
- **0-Second Freshness**: `JwtAuthenticationFilter` resolves user entity state (`enabled` and `role`) from PostgreSQL on every request. Admin role updates or deactivations take effect immediately on the user's very next API call.

---

## 3. Credential Protection & Cryptography
1. **Password Hashing**: BCrypt with work factor of 12.
2. **Complexity Enforcement**: Validated against `PasswordPolicyValidator` (minimum 8 chars, uppercase, lowercase, number, special character).
3. **Brute-Force & Lockout Defense**:
   - `RateLimitingFilter`: 15 requests/min per IP on all `/auth/**` routes.
   - Account Lockout: 5 consecutive failed attempts locks account for 15 minutes.
4. **Anti-Enumeration**: Generic response on password reset requests regardless of whether email exists.
5. **Zero Plaintext Invariant**: Passwords and raw secret tokens are never logged, serialized, or exposed in audit trails.

---

## 4. Security Audit Logging & Compliance
- Append-only `user_audit_logs` table records `LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `LOGOUT`, `USER_REGISTERED`, `USER_CREATED`, `USER_ACTIVATED`, `USER_DEACTIVATED`, `ROLE_CHANGED`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`.
- Captures actor, target, timestamp, IP address, and correlation `traceId`.
- Queryable only by `ROLE_ADMIN` via `/api/v1/admin/users/audit-logs`.
