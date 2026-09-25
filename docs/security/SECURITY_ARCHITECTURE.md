# FleetIQ — Security Architecture Specification

**Document Version:** 1.0.0-PROD  
**Classification:** Enterprise Security Baseline  
**Audience:** Security Architects, Penetration Testers, Compliance Auditors

---

## 1. Security Architecture Principles

FleetIQ implements a defense-in-depth architecture designed for zero-trust multi-OEM telematics operations. Security controls are enforced at network boundaries, application filters, service layers, and database transactions.

```
[ TLS 1.3 Termination / WAF ]
          │
          ▼
[ Rate Limiting Filter (RateLimitingFilter) ]  ──> Returns 429 Too Many Requests
          │
          ▼
[ Security Filter Chain (SecurityConfig) ]   ──> Validates JWT Bearer & Claims
          │
          ▼
[ Role-Based Authorization (@PreAuthorize) ]  ──> Enforces RBAC Permissions
          │
          ▼
[ Server-Side Validation (@Valid / DTOs) ]    ──> Prevents Malicious / Oversized Payloads
          │
          ▼
[ Parameterized Persistence (JPA / Flyway) ]   ──> Precludes SQL Injection
          │
          ▼
[ Immutable Security Audit (user_audit_logs) ] ──> Records Identity & Mutation Events
```

---

## 2. Authentication & JWT Token Lifecycle

- **Stateless Bearer Tokens:** Authentication is mediated via HMAC-SHA256 or RSA-256 signed JSON Web Tokens.
- **Expiration Policy:** Access tokens have an expiration window of 60 minutes (`fleetiq.jwt.expiration-ms=3600000`).
- **Cryptographic Secret Isolation:** JWT secrets are injected strictly via environment variable `JWT_SECRET`. No hardcoded fallback keys exist in production.
- **Password Storage:** Corporate user credentials are encrypted using BCrypt (`BCryptPasswordEncoder` with strength factor 12). Plaintext passwords are never persisted or logged.

---

## 3. Server-Side RBAC Permission Matrix

| Role | Telematics Stream | Action Mutations | AI Copilot | User Directory | Audit Logs | Schema Migrations |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ROLE_ADMIN** | Read | Mutate / Override | Full Access | Full CRUD | Read-Only | Read |
| **ROLE_OPERATOR** | Read | Mutate / Resolve | Read & Query | Denied | Denied | Denied |
| **ROLE_ANALYST** | Read | Read-Only | Read & Query | Denied | Denied | Denied |
| **ROLE_VIEWER** | Read | Read-Only | Read-Only | Denied | Denied | Denied |

*Frontend visibility is strictly a UX convenience; all security boundaries are validated on backend controllers.*

---

## 4. Input Sanitization & Attack Mitigations

1. **SQL Injection:** All queries use Spring Data JPA parameterized queries and Criteria API. Raw concatenated native SQL queries are strictly prohibited.
2. **Cross-Site Scripting (XSS):** React automatically escapes rendered strings in JSX. Content-Security-Policy (CSP) headers restrict script execution to trusted domains.
3. **Cross-Site Request Forgery (CSRF):** Disabled for stateless REST APIs utilizing JWT Bearer headers, as browser cookies are not utilized for ambient session authentication.
4. **Denial of Service (DoS):** Tiered IP rate limiting enforces request thresholds:
   - Auth endpoints: 15 req/min
   - AI Copilot: 40 req/min
   - Ingestion: 300 req/min
   - General API: 600 req/min
