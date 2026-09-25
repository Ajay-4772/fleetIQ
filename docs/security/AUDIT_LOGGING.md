# VEHYRON — Security Audit Logging & Compliance Specification

**Document Version:** 2.0.0-PROD  
**Specification:** Tamper-Evident Event Logging, Security Event Taxonomy, and Administrative Audit Trail  
**Target Compliance:** SOC 2 CC7.2, ISO 27001 A.12.4, HIPAA Security Rule 164.312(b)

---

## 1. Audit Logging Architecture

VEHYRON maintains an immutable, append-only security audit log persisted in PostgreSQL (`user_audit_logs`) and mirrored to structured application log streams via SLF4J / Logback with OpenTelemetry MDC correlation (`traceId`, `spanId`).

```
+-----------------------------------------------------------------------------------+
|                        SECURITY & IDENTITY EVENTS                                 |
| (AuthService, AdminUserService, JwtAuthenticationFilter, GlobalExceptionHandler) |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        UserAuditLogRepository (JPA)                               |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           POSTGRESQL DATABASE                                     |
| TABLE user_audit_logs:                                                            |
|   - id (BIGSERIAL PRIMARY KEY)                                                    |
|   - user_id (BIGINT REFERENCES users(id))                                         |
|   - actor_username (VARCHAR(50))                                                  |
|   - action (VARCHAR(50) NOT NULL)                                                 |
|   - details (TEXT)                                                                |
|   - ip_address (VARCHAR(45))                                                      |
|   - timestamp (TIMESTAMP WITH TIME ZONE NOT NULL)                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Security Event Taxonomy

| Action Category | Event Name | Trigger Condition | Example Details |
| :--- | :--- | :--- | :--- |
| **Authentication** | `LOGIN_SUCCESS` | Successful credential verification | `User authenticated successfully` |
| **Authentication** | `LOGIN_FAILED` | Bad password or non-existent user | `Bad credentials for user: jsmith` |
| **Authentication** | `ACCOUNT_LOCKED` | Reached 5 consecutive failed attempts | `Account locked for 15 minutes due to 5 failed attempts` |
| **Authentication** | `LOGOUT` | User session termination | `Active refresh tokens revoked` |
| **Account Lifecycle**| `USER_REGISTERED`| Public self-registration | `Self-registered with default role ROLE_VIEWER` |
| **Account Lifecycle**| `USER_CREATED` | Admin provisioning | `Created user with role: ROLE_OPERATOR` |
| **Account Lifecycle**| `USER_ACTIVATED` | Account enabled by Admin | `Account enabled by admin` |
| **Account Lifecycle**| `USER_DEACTIVATED`| Account disabled by Admin | `Account deactivated and refresh tokens revoked` |
| **Authorization** | `ROLE_CHANGED` | Role reassignment | `Role updated from ROLE_VIEWER to ROLE_OPERATOR` |
| **Credential Safety**| `PASSWORD_RESET_REQUESTED`| Reset token generated | `Password reset token issued` |
| **Credential Safety**| `PASSWORD_RESET_COMPLETED`| Reset token consumed | `Password successfully reset via single-use token` |

---

## 3. Strict Exclusions (Zero Sensitive Data)

To prevent security log poisoning and regulatory non-compliance, the following are strictly prohibited from being persisted in `details` or logs:
- Plaintext passwords or passphrase fragments.
- Raw Access Tokens (JWT) or Refresh Tokens (UUID).
- Password reset token strings.
- Ingestion API keys.
- Personally identifiable confidential information not strictly required for audit trails.

---

## 4. Administrative Inspection & Querying

Audit logs are accessible strictly to authenticated administrators via:
```http
GET /api/v1/admin/users/audit-logs?page=0&size=50
Authorization: Bearer <AdminJWT>
```

- Endpoint requires `@PreAuthorize("hasRole('ADMIN')")`.
- Non-admin callers (such as `ROLE_OPERATOR` or `ROLE_VIEWER`) receive `HTTP 403 Forbidden`.
- Returns paginated audit events ordered chronologically descending (`timestamp DESC`).
- Surfaced in the VEHYRON Enterprise User Directory UI in the dedicated **Security Audit Trail** tab.
