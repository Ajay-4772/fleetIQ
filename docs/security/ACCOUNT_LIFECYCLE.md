# VEHYRON — Enterprise Account Lifecycle & Governance

**Document Version:** 2.0.0-PROD  
**Specification:** Identity Provisioning, State Transitions, Role Elevation Governance, and Deprovisioning  
**Target Compliance:** ISO 27001 A.9.2, SOC 2 CC6.2, NIST SP 800-53 IA-4

---

## 1. Onboarding & Provisioning Models

VEHYRON supports two distinct user onboarding pathways designed to prevent unauthorized privilege escalation:

### 1.1. Self-Registration (Public Onboarding)
- **Endpoint:** `POST /api/v1/auth/register`
- **Default Authority:** Restrictive `ROLE_VIEWER` is assigned unconditionally by the backend. Any client-submitted role fields are disregarded.
- **Verification Status:** Account is initialized with `email_verified = false`.
- **Intended Usage:** Enterprise prospective users, external auditor access requests, or pilot evaluation accounts.

### 1.2. Administrative Provisioning (Enterprise Directory)
- **Endpoint:** `POST /api/v1/admin/users`
- **Authorization:** Strictly restricted to authenticated callers possessing `ROLE_ADMIN`.
- **Role Assignment:** Administrator explicitly selects the target authority (`ROLE_ADMIN`, `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER`).
- **Initial Password:** Provided by administrator or randomly generated, subject to enterprise password complexity validation.

---

## 2. Account State Machine

```
               +----------------------------+
               |     Self-Registration      |
               +----------------------------+
                             |
                             v
               +----------------------------+
               |    PENDING_VERIFICATION    |
               | (enabled=true, verified=0) |
               +----------------------------+
                             |
                             | Email Verification
                             v
               +----------------------------+
+------------> |           ACTIVE           | <-----------+
|              | (enabled=true, verified=1) |             |
|              +----------------------------+             |
|                  |                    |                 |
| 15-min lockout   | 5 failed logins    | Admin           | Admin
| expires          v                    | deactivation    | reactivation
|              +-------------------+    |                 |
|              |      LOCKED       |    |                 |
|              | (locked_until>now)|    |                 |
|              +-------------------+    v                 |
|                               +-------------------+     |
+------------------------------ |    DEACTIVATED    | ----+
                                |  (enabled=false)  |
                                +-------------------+
```

### State Definitions

| State | `enabled` | `email_verified` | `isAccountNonLocked()` | API Access |
| :--- | :---: | :---: | :---: | :--- |
| **ACTIVE** | `true` | `true` | `true` | Full API access matching assigned role permissions |
| **PENDING_VERIFICATION** | `true` | `false` | `true` | Restricted access; prompts for email verification |
| **LOCKED** | `true` | Any | `false` | All login attempts rejected with `423 Locked` until expiry |
| **DEACTIVATED** | `false` | Any | Any | All API calls and login rejected with `401 Unauthorized` |

---

## 3. Real-Time Administrative Governance

### 3.1. Role Reassignment
- **Endpoint:** `PUT /api/v1/admin/users/{id}/role`
- **Execution:**
  1. Admin submits `{ "role": "ROLE_OPERATOR" }`.
  2. Backend validates that caller has `ROLE_ADMIN`.
  3. `UserRepository` updates the entity in PostgreSQL.
  4. Audit record `ROLE_CHANGED` is logged with caller ID, target ID, old role, and new role.
  5. **Immediate Effect:** Because `JwtAuthenticationFilter` resolves user authorities from the database per-request, the target user's next request operates with the updated role immediately.

### 3.2. Account Deactivation
- **Endpoint:** `PUT /api/v1/admin/users/{id}/status`
- **Execution:**
  1. Admin submits `{ "enabled": false }`.
  2. Backend updates `users.enabled = false`.
  3. Backend revokes all active tokens in `refresh_tokens` for that user.
  4. Audit record `USER_DEACTIVATED` is logged.
  5. **Immediate Effect:** Any existing access token presented by the deactivated user is rejected with HTTP 401 on their very next request.

---

## 4. Lifecycle Audit Events

All lifecycle transitions generate immutable records in `user_audit_logs`:
- `USER_REGISTERED`: Self-service signup recorded with client IP.
- `USER_CREATED`: Admin-created account recorded with creating admin username.
- `USER_ACTIVATED`: Account enabled by administrator.
- `USER_DEACTIVATED`: Account disabled by administrator.
- `ROLE_CHANGED`: Role modification recorded with previous and new role.
- `PASSWORD_RESET_REQUESTED`: Reset token issued.
- `PASSWORD_RESET_COMPLETED`: Password successfully changed via token.
