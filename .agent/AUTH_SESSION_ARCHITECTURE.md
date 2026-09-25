# VEHYRON — Authentication & Session Architecture

**Version:** 2.0.0  
**Status:** Approved & Implemented  
**Classification:** Enterprise Security Architecture

---

## 1. Architectural Philosophy

VEHYRON is a mission-critical connected vehicle intelligence platform processing high-velocity multi-OEM telematics, fleet diagnostic fault codes, and automated decision queues. The authentication and session architecture must satisfy three core engineering invariants:

1. **Authoritative Server-Side Governance**: The backend is always the single source of truth. The frontend never decides authorization.
2. **Instant Revocation Capability**: Stateless JWTs alone cannot be revoked without expiration. VEHYRON implements a hybrid model combining cryptographically signed short-lived access tokens with live database verification in `JwtAuthenticationFilter` and server-persisted, rotatable refresh tokens.
3. **Defense-in-Depth**: Protection against token theft, brute-force dictionary attacks, CSRF, and account enumeration.

---

## 2. Token & Session Lifecycle

```
[ Client ]                         [ VEHYRON Auth Controller ]               [ Database (PostgreSQL/H2) ]
    │                                           │                                        │
    │ 1. POST /api/v1/auth/login                │                                        │
    ├──────────────────────────────────────────►│                                        │
    │    (username, password)                   │ 2. Verify BCrypt & Enabled             │
    │                                           ├───────────────────────────────────────►│
    │                                           │◄───────────────────────────────────────┤
    │                                           │                                        │
    │                                           │ 3. Generate Access Token (15 min)      │
    │                                           │ 4. Generate Refresh Token (7 days)     │
    │                                           │ 5. Save RefreshToken in DB             │
    │                                           ├───────────────────────────────────────►│
    │                                           │ 6. Save AuditLog (LOGIN_SUCCESS)       │
    │ 7. Return Access & Refresh Tokens         ├───────────────────────────────────────►│
    │◄──────────────────────────────────────────┤                                        │
    │                                           │                                        │
    │ ─── API Invocation Window ─────────────── │                                        │
    │                                           │                                        │
    │ 8. GET /api/v1/vehicles                   │                                        │
    │    Authorization: Bearer <AccessToken>    │ 9. JwtAuthFilter validates JWT         │
    │──────────────────────────────────────────►│ 10. Check live User.isEnabled() in DB  │
    │                                           ├───────────────────────────────────────►│
    │                                           │◄───────────────────────────────────────┤
    │ 11. 200 OK + Payload                      │                                        │
    │◄──────────────────────────────────────────┤                                        │
    │                                           │                                        │
    │ ─── Token Refresh / Rotation ──────────── │                                        │
    │                                           │                                        │
    │ 12. POST /api/v1/auth/refresh             │ 13. Validate RefreshToken in DB        │
    │     (refreshToken)                        ├───────────────────────────────────────►│
    │                                           │ 14. Mark old token REVOKED             │
    │                                           │ 15. Issue NEW Refresh Token (Rotate)   │
    │                                           │ 16. Issue NEW Access Token (15 min)    │
    │ 17. Return Rotated Tokens                 │                                        │
    │◄──────────────────────────────────────────┤                                        │
    │                                           │                                        │
    │ ─── Logout / Revocation ───────────────── │                                        │
    │                                           │                                        │
    │ 18. POST /api/v1/auth/logout              │ 19. Mark RefreshToken REVOKED          │
    │     (refreshToken)                        ├───────────────────────────────────────►│
    │                                           │ 20. Record AuditLog (LOGOUT)           │
    │ 21. 200 OK Session Cleared                ├───────────────────────────────────────►│
    │◄──────────────────────────────────────────┤                                        │
```

---

## 3. Token Specifications

### A. Access Token (Stateless JWT)
* **Algorithm**: HMAC-SHA256 (`HS256`) with a cryptographically secure 256-bit key.
* **Lifetime**: 15 minutes (`900,000 ms`). Short duration prevents exposure if a client-side token is compromised.
* **Claims**:
  * `sub`: Username (e.g. `dispatcher_dave`)
  * `role`: Active role name (e.g. `ROLE_OPERATOR`)
  * `iat`: Issued at timestamp
  * `exp`: Expiration timestamp (now + 15 min)
* **Transport**: HTTP `Authorization: Bearer <token>` header.

### B. Refresh Token (Stateful & Rotatable)
* **Token Structure**: 64-character cryptographically random hex token generated via `SecureRandom`.
* **Storage**: Stored in the `refresh_tokens` database table with foreign key linkage to `users(id)`.
* **Lifetime**: 7 days (`604,800,000 ms`).
* **Rotation**: Each time `/api/v1/auth/refresh` is called, the supplied refresh token is marked `revoked = true` and a fresh refresh token is issued.
* **Revocation Scope**:
  * When a user clicks **Logout**, their active refresh token is marked revoked.
  * When an administrator **deactivates an account**, all refresh tokens for that user ID are marked revoked.
  * When a user **resets their password**, all existing sessions and refresh tokens are invalidated immediately.

---

## 4. Real-Time Authorization Freshness Guarantee

To solve the "stale JWT" problem without sacrificing latency:

1. **Immediate Revocation**: `JwtAuthenticationFilter` performs an in-memory or indexed query against `userRepository.findByUsername(username)`. If `user.isEnabled() == false`, the request is immediately terminated with HTTP 401/403.
2. **Immediate Role Reflection**: The `GrantedAuthority` populated in Spring's `SecurityContextHolder` is retrieved directly from `user.getRole()`, NOT blindly from the claims of the JWT. If an administrator upgrades a user from `ROLE_VIEWER` to `ROLE_OPERATOR`, the very next API call made by that user is executed under `ROLE_OPERATOR`.
3. **Propagation Latency**: **0 seconds (Deterministic & Immediate)**. The change takes effect on the next database read within the active request transaction.

---

## 5. Security & Threat Modeling Controls

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Token Theft** | Short access token TTL (15 min) + Refresh token rotation. A stolen refresh token can only be used once; reusing a revoked token triggers an alarm. |
| **Credential Stuffing** | Rate limiting filter (`RateLimitingFilter.java`) limits failed attempts per IP. Account locks for 15 minutes after 5 consecutive failed attempts. |
| **Account Enumeration** | Forgot password endpoint returns a constant generic message ("If the email exists, instructions have been dispatched") regardless of whether the email was found. |
| **Privilege Escalation** | Self-service registration assigns strictly `ROLE_VIEWER`. The requested role field is ignored on public endpoints. |
| **CSRF** | Bearer token authorization in headers is impervious to cross-site request forgery. |
| **Insider Threat** | Administrators cannot deactivate their own accounts; every role promotion/demotion writes to an immutable `user_audit_logs` table. |
