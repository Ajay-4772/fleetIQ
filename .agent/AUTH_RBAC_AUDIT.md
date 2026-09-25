# FleetIQ — Authentication & RBAC Architecture Audit

**Audit Date**: September 25, 2026  
**Auditor**: Principal Security Engineer + Backend Architect  
**Scope**: Authentication, Authorization, Server-Side RBAC, Session Lifecycle, User Deactivation, Role Mutations, Audit Trail  
**Status**: AUDITED — CRITICAL GAPS IDENTIFIED & FIXES DESIGNED

---

## 1. Current State Analysis

### 1.1 Authentication Mechanism
- **Implementation**: Stateless JWT authentication with `BCryptPasswordEncoder` (12 rounds) for password storage.
- **Login Endpoint**: `/api/v1/auth/login` accepts `LoginRequest` (username, password), validates against `userRepository.findByUsername(username)`, and verifies password using `passwordEncoder.matches()`.
- **JWT Issuance**: `JwtTokenProvider` generates an HMAC-SHA256 signed token containing `sub` (username), `role`, `iat`, and `exp` (default 24 hours).
- **Public Endpoints**: `/api/v1/auth/**`, `/actuator/health`, `/actuator/info`, `/h2-console/**`, and `/api/v1/stream/**`.

### 1.2 Authorization & Role-Based Access Control (RBAC)
- **Role Hierarchy**: `ROLE_ADMIN`, `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER`, `ROLE_INGESTION`.
- **Server Enforcement in `SecurityConfig.java`**:
  - Ingestion (`POST /api/v1/events/ingest`): Requires `ROLE_INGESTION`, `ROLE_OPERATIONS_LEAD`, or `ROLE_ADMIN`.
  - Action Status Mutations (`PATCH /api/v1/actions/**`): Requires `ROLE_OPERATOR`, `ROLE_OPERATIONS_LEAD`, or `ROLE_ADMIN`. (`ROLE_VIEWER` gets 403).
  - Simulator (`/api/v1/simulator/**`): Requires `ROLE_OPERATIONS_LEAD` or `ROLE_ADMIN`. (`ROLE_OPERATOR` and `ROLE_VIEWER` get 403).
  - Admin User Governance (`/api/v1/admin/**`): Requires `ROLE_ADMIN`.
  - Telemetry & Dashboard Reads (`/api/v1/**`): Requires any authenticated user.

---

## 2. Identified Security & Authorization Deficiencies

### Defect SEC-001: Disconnected JWT Claims vs Active Database State (Stateless Staleness)
- **Current Behavior**: `JwtAuthenticationFilter` reads `username` and `role` strictly from JWT claims (`tokenProvider.getRoleFromToken(token)`) without querying `userRepository`.
- **Security Impact**:
  1. **Deactivated Users Retain Access**: If an Admin deactivates a malicious or departed user via `PATCH /api/v1/admin/users/{id}/status?enabled=false`, the user's existing JWT remains valid for up to 24 hours, completely bypassing account suspension.
  2. **Role Mutations are Delayed**: If an Admin demotes an Operator to Viewer (`ROLE_OPERATOR` -> `ROLE_VIEWER`), the user continues to execute privileged operational mutations until token expiration.
- **Remediation**:
  In `JwtAuthenticationFilter`, look up the user by `username` in `userRepository`.
  - If `!user.isEnabled()`, reject request immediately (clear security context, let filter chain return 401/403).
  - Use `user.getRole()` as the source of truth for granted authorities rather than static token claims. This delivers **instant real-time server-authoritative RBAC updates and instant deactivation**.

### Defect SEC-002: Missing Audit Logging for Authentication Lifecycle
- **Current Behavior**: `UserService` logs `USER_CREATED`, `USER_DEACTIVATED`, `USER_REACTIVATED`, and `ROLE_CHANGED` to `user_audit_logs`. However, `AuthController` does not log `LOGIN_SUCCESS`, `LOGIN_FAILURE`, or `LOGOUT`.
- **Security Impact**: Security teams cannot inspect brute-force attempts, failed logins, or session timeline audits.
- **Remediation**:
  In `AuthController`:
  - Record `LOGIN_SUCCESS` with client IP and username.
  - Record `LOGIN_FAILURE` when credentials do not match or user is disabled.
  - Add `POST /api/v1/auth/logout` endpoint that logs `LOGOUT` in `user_audit_logs`.

### Defect SEC-003: Public Login Page Leaking Internal Security Architecture
- **Current Behavior**: `LoginPage.tsx` displays "Security Protocol: TLS 1.3 / JWT RBAC".
- **Remediation**:
  Remove internal architecture buzzwords from the login interface. Present a clean, standard enterprise login form with username, password, validation feedback, and legal links.

### Defect SEC-004: Lack of Self-Service Account Lifecycle Options
- **Current Behavior**: Only Admin can create users. Normal users have no mechanism to request access or reset forgotten passwords.
- **Remediation**:
  Provide clean "Request Access" / "Forgot Password" operational flows connected to backend audit handling.

---

## 3. Real-Time RBAC State Matrix

| Operation | Admin (`ROLE_ADMIN`) | Operations Lead (`ROLE_OPERATIONS_LEAD`) | Operator (`ROLE_OPERATOR`) | Viewer (`ROLE_VIEWER`) | Unauthenticated |
|---|---|---|---|---|---|
| View Overview Dashboard | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| View Vehicle Registry | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| View Vehicle Telemetry Modal | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| View Live SSE Telemetry | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| View Priority Actions Queue | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| Mutate Priority Action Status | ALLOW | ALLOW | ALLOW | **DENY (403)** | DENY (401) |
| Query AI Copilot Workspace | ALLOW | ALLOW | ALLOW | ALLOW | DENY (401) |
| Launch Scenario Simulator | ALLOW | ALLOW | **DENY (403)** | **DENY (403)** | DENY (401) |
| Access User Directory | ALLOW | **DENY (403)** | **DENY (403)** | **DENY (403)** | DENY (401) |
| Create / Deactivate Users | ALLOW | **DENY (403)** | **DENY (403)** | **DENY (403)** | DENY (401) |
| Mutate User Roles | ALLOW | **DENY (403)** | **DENY (403)** | **DENY (403)** | DENY (401) |
| View Security Audit Logs | ALLOW | **DENY (403)** | **DENY (403)** | **DENY (403)** | DENY (401) |
