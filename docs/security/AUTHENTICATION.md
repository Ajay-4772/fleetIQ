# FleetIQ — Enterprise Authentication & Session Architecture

**Document Version:** 1.0.0-PROD  
**Specification:** Identity, Token Handling, and Credential Security

---

## 1. Authentication Overview

FleetIQ authenticates operators, analysts, and administrators using industry-standard stateless JSON Web Tokens (JWT). The system prohibits demo credentials, mock logins, and client-side credential verification in production environments.

### Authentication Endpoints
- `POST /api/v1/auth/login`: Authenticates username + password; issues a signed JWT Bearer token and returns user profile metadata.
- `GET /api/v1/auth/me`: Validates active token and returns the caller's identity and assigned roles.

---

## 2. Token Specification & Security Properties

- **Algorithm:** HMAC-SHA256 (`HS256`) using a 256-bit cryptographically secure key.
- **Subject:** Username of the authenticated user.
- **Claims:**
  - `role`: Canonical Spring Security authority (e.g., `ROLE_ADMIN`, `ROLE_OPERATOR`).
  - `name`: Human-readable full name.
  - `iat`: Timestamp of token issuance.
  - `exp`: Timestamp of token expiration (default 3,600,000 ms / 1 hour).
- **Transport Security:** Must be transmitted strictly via `Authorization: Bearer <TOKEN>` over TLS 1.3.

---

## 3. Password Hashing & Account Lifecycle

1. **Hashing Algorithm:** BCrypt with a cost parameter of 12.
2. **Account Disablement:** Accounts flagged with `enabled = false` are rejected during authentication with an HTTP 401 Unauthorized response before password verification completes.
3. **Audit Logging:** Every successful login and every failed authentication attempt is recorded in `user_audit_logs` with actor username, timestamp, and client IP address.
4. **Environment Isolation:**
   - **Development Profile:** May seed default test accounts via Flyway (`V2__user_audit_and_copilot_chat.sql`) with default passwords.
   - **Production Profile:** Requires database migration or administrative provisioning with randomized temporary passwords; pre-seeded demo accounts must be disabled.
