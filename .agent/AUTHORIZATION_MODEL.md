# FleetIQ — Enterprise Authorization & RBAC Architecture Model

**Document Version**: 2.0.0  
**Authority**: Principal Security Architect  
**Scope**: Server-Authoritative Multi-Layer Access Control, Session Lifecycle, and Real-Time Authorization  

---

## 1. Architectural Philosophy: The Frontend Is Not a Security Boundary

In FleetIQ, client-side role checks (such as `hasRole('ADMIN')`) exist strictly for user experience (hiding irrelevant navigation items and reducing cognitive friction). The server alone determines authorization.

Any API request originating from a client—regardless of what the frontend UI displayed—must pass through a 5-layer server security pipeline:

```text
Incoming HTTP Request
        ↓
[1. RateLimitingFilter]   → IP/Token Tiered Rate Limiting (15-600 req/min)
        ↓
[2. JwtAuthenticationFilter]
        → Extract JWT
        → Validate HMAC-SHA256 signature & expiration
        → Query UserRepository for User Entity
        → Enforce user.isEnabled() == true (Instant Account Suspension)
        → Extract Current Database Role (Instant Role Change Reflection)
        → Bind SecurityContextHolder Authentication with GrantedAuthorities
        ↓
[3. SecurityConfig RequestMatchers]
        → Match URL pattern and HTTP Method against required authorities
        → Return 401 Unauthorized or 403 Forbidden on failure
        ↓
[4. Controller @PreAuthorize Annotations]
        → Method-level role and permission verification
        ↓
[5. Service Layer Business Invariants & Audit Logging]
        → Execute business logic within @Transactional boundary
        → Emit immutable record to UserAuditLogRepository
```

---

## 2. Server-Authoritative Real-Time Role & Status Transitions

### 2.1 Instant Account Deactivation Flow
When an Administrator deactivates a user via `PATCH /api/v1/admin/users/{id}/status?enabled=false`:
1. `UserService.updateUserStatus()` validates that the actor is not deactivating themselves.
2. `user.setEnabled(false)` is committed to the database in a transactional boundary.
3. A security audit record `USER_DEACTIVATED` is persisted in `user_audit_logs`.
4. On the very next HTTP request from the deactivated user, `JwtAuthenticationFilter` reads `user.isEnabled() == false`, aborts authentication, and the request immediately fails with `401 Unauthorized` / `403 Forbidden`. The user cannot execute any further read or write operations.

### 2.2 Instant Role Mutation Flow
When an Administrator alters a user's role (e.g., `ROLE_OPERATOR` -> `ROLE_VIEWER`):
1. `user.setRole(newRole)` is committed to the database.
2. A security audit record `ROLE_CHANGED` is persisted with previous and new roles.
3. On the user's very next HTTP request, `JwtAuthenticationFilter` resolves granted authorities from `user.getRole()`. Privileged endpoints (such as `PATCH /api/v1/actions/{id}/status`) immediately reject the request with `403 Forbidden` without requiring backend restarts or token revocation lists.

---

## 3. Session & Authentication Lifecycle

1. **Authentication (`POST /api/v1/auth/login`)**:
   - Compares raw password against BCrypt hash in `users` table.
   - Rejects disabled users immediately with `403 Forbidden`.
   - Records `LOGIN_SUCCESS` or `LOGIN_FAILURE` in `user_audit_logs`.
   - Emits stateless JWT token with configurable expiration.

2. **Session Logout (`POST /api/v1/auth/logout`)**:
   - Clears client-side authorization headers and local session.
   - Records `LOGOUT` in `user_audit_logs`.

3. **Current Profile Inspection (`GET /api/v1/auth/me`)**:
   - Resolves caller from `SecurityContextHolder`.
   - Returns real-time database profile and enforced role badge.
