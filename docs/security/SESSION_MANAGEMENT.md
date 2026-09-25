# FleetIQ — Enterprise Session Management Specification

**Document Version:** 2.0.0-PROD  
**Specification:** Dual-Token Session Lifecycle, Token Rotation, Stateful Revocation, and Invalidation  
**Target Compliance:** OWASP Session Management Cheat Sheet, NIST SP 800-63B

---

## 1. Session Architecture Overview

FleetIQ implements a hybrid session architecture combining the scalability of stateless JWT access tokens with the granular control of stateful, rotatable refresh tokens stored in PostgreSQL.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT APPLICATION                                 |
+-----------------------------------------------------------------------------------+
       |                                                            |
       | Bearer Access Token (15-min JWT)                          | Refresh Token (7-day UUID)
       v                                                            v
+------------------------------------+             +--------------------------------+
|      JwtAuthenticationFilter       |             |           AuthService          |
+------------------------------------+             +--------------------------------+
       |                                                            |
       | Validates signature & expiry                               | Validates token in DB
       | Fetches User entity (real-time check)                      | Rotates token & issues new JWT
       v                                                            v
+-----------------------------------------------------------------------------------+
|                               POSTGRESQL DATABASE                                 |
|   - users: id, username, email, enabled, role, failed_attempts, locked_until       |
|   - refresh_tokens: id, user_id, token, expires_at, revoked, created_at           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Token Specifications & Parameters

| Attribute | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Format** | Signed JSON Web Token (JWT) | Cryptographically Secure 128-bit UUID |
| **Algorithm** | HMAC-SHA256 (`HS256`) | CSPRNG Random UUIDv4 |
| **Storage (Backend)** | Stateless (Signed with `JWT_SECRET`) | Stateful (`refresh_tokens` database table) |
| **Storage (Client)** | Local storage / Secure application state | Local storage / Secure application state |
| **Validity Duration** | 15 minutes (`900,000` ms) | 7 days (`604,800` seconds) |
| **Renewable** | Yes, via `/api/v1/auth/refresh` | No (Rotated on each exchange) |
| **Revocation Check** | Real-time via DB User enabled status | DB lookup (`revoked = true` check) |

---

## 3. Session Lifecycle Flows

### 3.1. Session Establishment (Login)
1. User provides credentials to `POST /api/v1/auth/login`.
2. System verifies BCrypt password and confirms `user.isEnabled() == true` and `user.isAccountNonLocked() == true`.
3. System generates a fresh 7-day `RefreshToken` and commits it to the database.
4. System generates a signed 15-minute Access Token JWT containing principal claims.
5. System returns both tokens alongside user identity and permissions.

### 3.2. Token Rotation (Refresh)
1. When the access token expires, client issues `POST /api/v1/auth/refresh` with the current refresh token.
2. `AuthService` queries `refresh_tokens` by token string.
3. If token is missing, expired (`expiresAt < now()`), or revoked (`revoked == true`), the request is rejected with **401 Unauthorized**.
4. If token is valid, `AuthService` **immediately marks the incoming token as revoked** (`revoked = true`).
5. A completely new refresh token is generated and persisted in the database.
6. A newly signed access token is generated.
7. Both new tokens are returned to the client, ensuring complete token rotation.

### 3.3. Explicit Termination (Logout)
1. User clicks Logout or triggers session termination.
2. Client sends `POST /api/v1/auth/logout`.
3. `AuthService` marks all active refresh tokens for the authenticated user as revoked:
   ```sql
   UPDATE refresh_tokens SET revoked = true WHERE user_id = :userId;
   ```
4. Client purges all stored tokens from browser state and redirects to `/login`.

### 3.4. Administrative Revocation & Account Deactivation
1. Administrator toggles user status to Deactivated via `PUT /api/v1/admin/users/{id}/status`.
2. Target user's `enabled` field in `users` table is set to `false`.
3. Target user's active refresh tokens are revoked in `refresh_tokens`.
4. **Immediate Effect:** Because `JwtAuthenticationFilter` inspects `user.isEnabled()` on every HTTP request, the deactivated user's access token is rejected on their very next API call with HTTP 401 Unauthorized, achieving **0-second access revocation**.

---

## 4. Concurrent Sessions & Multi-Device Governance

- FleetIQ supports concurrent sessions across multiple devices.
- Each device/browser login establishes an independent `RefreshToken` record tied to the user's `user_id`.
- Revoking a specific session invalidates only that device's token.
- Changing a password or administrative deactivation performs a cascade revocation of **all** refresh tokens belonging to the user.
