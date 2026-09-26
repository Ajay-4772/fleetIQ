# VEHYRON — Security Handover & Vulnerability Governance

**Document Version:** 1.0.0-PROD  
**Classification:** Security Architecture & Transfer  
**Audience:** Chief Information Security Officer (CISO), Corporate SecOps

---

## 1. Security Baseline & Key Controls

1. **Identity & Authentication:** Stateless HMAC-SHA256 JWT tokens with 1-hour expiration. Passwords hashed using BCrypt (factor 12).
2. **Access Governance (RBAC):** Backend method security via `@PreAuthorize`. Administrator endpoints (`/api/v1/admin/users/**`) require `ROLE_ADMIN`.
3. **Protection Against Brute Force:** Tiered `RateLimitingFilter` enforcing strict 15 req/min limits on login endpoints.
4. **Zero Stack Trace Leakage:** Unified `GlobalExceptionHandler` ensures all exceptions emit structured `ApiErrorResponse` JSON without SQL queries, class paths, or internal server errors.
5. **Immutable Audit Trails:** User creation, role changes, account disablement, and priority action overrides are recorded in the `user_audit_logs` table.

---

## 2. Secrets Management & Key Rotation Procedure

### Rotating the Production JWT Signing Key
1. Generate a new cryptographically secure 256-bit secret:
   ```bash
   openssl rand -base64 32
   ```
2. Store the new key in corporate AWS Secrets Manager / HashiCorp Vault under key `vehyron_JWT_SECRET`.
3. Update the container runtime environment variable `JWT_SECRET`.
4. Trigger a rolling restart of backend pods. Existing client sessions will be prompted to re-authenticate at `/api/v1/auth/login`.

---

## 3. Vulnerability Reporting & Dependency Scanning
- GitHub Actions runs automated dependency scanning on pull requests.
- External security reports should be routed to `security@[COMPANY_DOMAIN_PLACEHOLDER]`.
