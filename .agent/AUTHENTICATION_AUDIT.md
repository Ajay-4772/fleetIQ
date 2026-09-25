# VEHYRON — Complete Authentication & Authorization Security Audit

**Audit Date:** September 2026  
**Auditor:** Principal Software Architect & Lead Security Engineer  
**Scope:** Frontend Authentication UI, Spring Security Configuration, JWT Pipeline, User & Role Entities, Flyway Migrations, API Authorization, and Session Management.

---

## 1. What Currently Works (Verified Implementation)

1. **Spring Security Architecture & Filter Chain**:
   * [`SecurityConfig.java`](file:///c:/Users/ajaya/Desktop/fleetiq/backend/src/main/java/com/fleetiq/security/SecurityConfig.java) sets up a stateless security filter chain with custom JSON `AuthenticationEntryPoint` (401 Unauthorized) and `AccessDeniedHandler` (403 Forbidden).
   * Spring Method Security is enabled via `@EnableMethodSecurity`.
   * Standard endpoints are guarded by authorities:
     * Public: `/api/v1/auth/**`, `/actuator/health`, `/actuator/info`, `/h2-console/**`, `/api/v1/stream/**`.
     * Admin-only: `/api/v1/admin/**`, `/api/v1/system/**` require `hasAuthority('ROLE_ADMIN')`.
     * Mutation endpoints: `/api/v1/actions/**` require `ROLE_OPERATOR`, `ROLE_OPERATIONS_LEAD`, or `ROLE_ADMIN`.
     * Simulator: `/api/v1/simulator/**` requires `ROLE_OPERATIONS_LEAD` or `ROLE_ADMIN`.
     * Ingestion: `/api/v1/events/ingest` requires `ROLE_INGESTION`, `ROLE_OPERATIONS_LEAD`, `ROLE_ADMIN`, or a valid `X-API-Key`.
     * Read queries: Authenticated (`ROLE_VIEWER`, etc.).
2. **Real-Time DB-Backed Authority & Instant Revocation**:
   * [`JwtAuthenticationFilter.java`](file:///c:/Users/ajaya/Desktop/fleetiq/backend/src/main/java/com/fleetiq/security/JwtAuthenticationFilter.java) validates JWT tokens on every incoming request and checks `userRepository.findByUsername(username)`.
   * If `user.isEnabled() == false`, authentication is instantly refused (session revoked immediately without waiting for token expiration).
   * The user's active authority in `SecurityContextHolder` is populated from the live database, ensuring role mutations (e.g., Viewer promoted to Operator) take effect immediately on the very next request.
3. **Password Hashing**:
   * Passwords in the database are hashed with BCrypt (`BCryptPasswordEncoder`).
   * Passwords are not returned in `UserAdminDto` or `UserProfileDto`.
4. **Admin User Management**:
   * [`AdminUserController.java`](file:///c:/Users/ajaya/Desktop/fleetiq/backend/src/main/java/com/fleetiq/controller/AdminUserController.java) supports listing users, searching, creating users, toggling account active/disabled status, and mutating roles.
   * Administrators cannot disable their own accounts (lockout protection).
5. **Security Audit Logging**:
   * [`UserAuditLog.java`](file:///c:/Users/ajaya/Desktop/fleetiq/backend/src/main/java/com/fleetiq/model/UserAuditLog.java) persists security events: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `USER_CREATED`, `USER_DEACTIVATED`, `USER_REACTIVATED`, `ROLE_UPDATED`, `LOGOUT`.

---

## 2. What Was Mocked / Simulated

1. **User Registration / Signup**:
   * The frontend `LoginPage.tsx` contained a "Create account!" form that executed a local JavaScript `setTimeout` without calling any backend endpoint.
   * The backend lacked a public `/api/v1/auth/register` endpoint.
2. **Forgot Password**:
   * In `LoginPage.tsx`, submitting the "Forgot Password" form set local React state with a `setTimeout` feedback message.
   * No backend endpoint existed to issue or verify password reset tokens.
3. **Reset Password**:
   * No reset password flow (`/reset-password?token=...`) existed on either frontend or backend.
4. **Session Refresh**:
   * Token refresh was completely simulated. The access token had a 24-hour lifetime without refresh token rotation or server-side refresh revocation.

---

## 3. What Was Frontend-Only

1. **Quick Dev Credentials**:
   * The login interface displayed "QUICK DEV CREDENTIALS" chips (`Admin`, `Operator`, `Viewer`) with hardcoded pre-fill credentials in the production component.
2. **Copied UI Design**:
   * The login UI was an imitation of an external two-card template with decorative SVG blobs, not matching VEHYRON's enterprise operational dashboard aesthetic.

---

## 4. What Is Backend-Enforced

1. **All Protected REST APIs**:
   * Requests without `Authorization: Bearer <token>` or `X-API-Key` return HTTP 401.
   * Requests by `ROLE_VIEWER` to `/api/v1/actions/**` or `/api/v1/admin/**` return HTTP 403 Forbidden.
2. **Password Verification**:
   * Checked via `passwordEncoder.matches(request.getPassword(), user.getPassword())`.
3. **Account Disabled Enforcement**:
   * Disabled users cannot log in (returns HTTP 403 "User account is disabled").
   * Active sessions of disabled users are immediately blocked in `JwtAuthenticationFilter`.

---

## 5. Security Weaknesses & Gaps Identified

| ID | Category | Problem Description | Severity | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Session / Token | Single JWT without refresh token mechanism. 24-hour token lifetime is too long for high-security enterprise telematics. | High | Implement short-lived Access Token (15 min) + persistent, rotatable Refresh Token stored in DB. |
| **SEC-02** | User Model | `users` table lacks `email`, `email_verified`, `last_login_at`, and `failed_attempts`. | Medium | Add Flyway migration `V3__auth_tokens_and_user_lifecycle.sql` to add user lifecycle fields. |
| **SEC-03** | Registration | No server-side registration endpoint. Public self-signup must enforce default restricted role (`ROLE_VIEWER`). | High | Implement `POST /api/v1/auth/register` with strict validation, preventing role escalation. |
| **SEC-04** | Password Reset | No secure reset token mechanism. Users cannot reset forgotten passwords securely. | High | Implement `PasswordResetToken` table, `/forgot-password`, and `/reset-password` endpoints. |
| **SEC-05** | UI Credentials | Hardcoded quick dev credentials rendered on the production login screen. | Critical | Remove quick credentials completely from production UI; isolate test fixtures to tests. |
| **SEC-06** | UI Aesthetic | Vibe-coded, copied two-card layout with decorative blobs instead of authentic VEHYRON enterprise theme. | Medium | Redesign original single-portal enterprise layout adhering to VEHYRON design tokens. |
| **SEC-07** | Password Policy | No server-side enforcement of password complexity (minimum length, uppercase, numbers, symbols). | Medium | Implement `PasswordPolicyValidator` enforcing enterprise complexity rules. |
| **SEC-08** | Brute Force Protection | Account lockout mechanism missing after repeated failed login attempts. | Medium | Track `failed_attempts` and `locked_until` in `User` entity. |

---

## 6. Required Architectural Changes Summary

1. **Database Schema**:
   * Create `V3__auth_tokens_and_user_lifecycle.sql` adding `email`, `email_verified`, `last_login_at`, `failed_attempts`, and `locked_until` to `users`.
   * Create `refresh_tokens` table for server-side session management and token rotation.
   * Create `password_reset_tokens` table for cryptographic single-use password resets.
2. **Backend Domain & Services**:
   * Add `RefreshToken` and `PasswordResetToken` entities and JPA repositories.
   * Implement `AuthService` handling `login`, `register`, `refreshToken`, `forgotPassword`, `resetPassword`, and `logout`.
   * Expose REST endpoints in `AuthController`:
     * `POST /api/v1/auth/login`
     * `POST /api/v1/auth/register`
     * `POST /api/v1/auth/refresh`
     * `POST /api/v1/auth/forgot-password`
     * `POST /api/v1/auth/reset-password`
     * `POST /api/v1/auth/logout`
     * `GET /api/v1/auth/me`
3. **Frontend Authentication Architecture**:
   * Update `AuthContext.tsx` with full session state lifecycle (`UNAUTHENTICATED`, `AUTHENTICATING`, `AUTHENTICATED`, `SESSION_EXPIRED`, `ACCOUNT_DISABLED`, `LOGGING_OUT`).
   * Implement automatic token refresh on expiry and token rotation.
   * Completely rebuild `LoginPage.tsx` into an authentic, calm, enterprise-grade VEHYRON authentication portal supporting Sign In, Register, Forgot Password, and Reset Password views with comprehensive error and loading states.
   * Remove all decorative background blobs and quick-dev credentials from production UI.
