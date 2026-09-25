# FleetIQ — Authentication & RBAC Traceability Matrix

**Version**: 2.0.0  
**Status**: ACTIVE  

---

| Item | Requirement | Verification Target | Implementation Layer | Enforcement Status |
|---|---|---|---|---|
| **AUTH-01** | Stateless JWT Validation | Validates HMAC-SHA256 signature, expiry, and payload | `JwtTokenProvider.java` | VERIFIED |
| **AUTH-02** | Password Hashing | BCrypt with 12 rounds for all passwords | `SecurityConfig.java`, `UserService.java` | VERIFIED |
| **AUTH-03** | Server-Authoritative Active User Check | Checks `user.isEnabled()` on every HTTP request | `JwtAuthenticationFilter.java` | IMPLEMENTING |
| **AUTH-04** | Real-Time Role Authority Resolution | Grants authorities based on current `user.getRole()` in database | `JwtAuthenticationFilter.java` | IMPLEMENTING |
| **AUTH-05** | Instant Account Deactivation | Disabling user via Admin immediately blocks subsequent requests with 401/403 | `UserService.java`, `JwtAuthenticationFilter.java` | IMPLEMENTING |
| **AUTH-06** | Self-Service Access Request / Forgot Password | User can submit access request or reset password | `LoginPage.tsx`, `AuthController.java` | IMPLEMENTING |
| **AUTH-07** | Authentication Audit Logging | Logs `LOGIN_SUCCESS`, `LOGIN_FAILURE`, and `LOGOUT` with IP address | `AuthController.java`, `UserAuditLog.java` | IMPLEMENTING |
| **AUTH-08** | Ingestion Authorization | Rejects non-ingestion/non-admin callers attempting `/api/v1/events/ingest` | `SecurityConfig.java` (`hasAnyAuthority`) | VERIFIED |
| **AUTH-09** | Action Mutation Authorization | Rejects `ROLE_VIEWER` callers attempting `PATCH /api/v1/actions/**` | `SecurityConfig.java` | VERIFIED |
| **AUTH-10** | Simulator Authorization | Rejects `ROLE_VIEWER` and `ROLE_OPERATOR` callers attempting `/api/v1/simulator/**` | `SecurityConfig.java` | VERIFIED |
| **AUTH-11** | User Management Authorization | Restricts `/api/v1/admin/users/**` strictly to `ROLE_ADMIN` | `SecurityConfig.java`, `AdminUserController.java` | VERIFIED |
| **AUTH-12** | Global Error Uniformity | Unauthorized/Forbidden requests emit standard `ApiErrorResponse` JSON with correlation ID | `SecurityConfig.java`, `GlobalExceptionHandler.java` | VERIFIED |
