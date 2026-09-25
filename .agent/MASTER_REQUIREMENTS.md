# FleetIQ — Master Requirements Specification

**Document Version**: 2.0.0-PROD  
**Status**: ACTIVE / CANONICAL  
**Last Updated**: September 25, 2026  
**Purpose**: Consolidate every functional and non-functional requirement across all engineering domains, user prompts, authentication rebuild milestones, and handover contracts into one unified master specification.

---

## 1. Product Requirements
- **PRD-01**: FleetIQ must function as an enterprise-grade connected vehicle intelligence platform providing real-time fleet health monitoring, predictive maintenance alerts, and prioritized operational action directives.
- **PRD-02**: The platform must support multiple commercial automotive and heavy-duty OEMs through decoupled telemetry normalization adapters.
- **PRD-03**: All operational decisions must provide clear financial impact attribution (downtime risk cost, critical failure prevention ROI).
- **PRD-04**: The system must operate reliably 24/7 with zero dependence on experimental AI availability.

## 2. Frontend Requirements
- **FED-01**: Replace the AI Copilot side-modal (`AiAssistantModal.tsx`) with a dedicated, first-class full-page interface (`/intelligence/copilot`).
- **FED-02**: Remove the 3D animated blue glowing orb (`animate-orb`), blue drop-shadows, and pulsating radio glow. Enforce clean, restrained, enterprise visual styling.
- **FED-03**: Support dark/light visual consistency with subtle borders, enterprise typography, clear status badges, and accessible contrast.
- **FED-04**: Provide rich states across all views: Loading skeletons, Empty states (no vehicles, no alerts, no conversations), and Error boundary recovery.

## 3. Backend Requirements
- **BED-01**: Maintain a clean layered architecture: Controllers -> Services -> Repositories -> JPA Entities.
- **BED-02**: Guarantee thread safety and concurrency safety across ingestion pipelines and real-time SSE broadcasts.
- **BED-03**: Ensure zero application logic coupling to IDE tooling or external developer-machine artifacts.
- **BED-04**: Provide vendor-neutral abstractions for AI inference and telemetry streaming.

## 4. Database Requirements
- **DBD-01**: PostgreSQL 15/16 as primary production database; H2 in PostgreSQL compatibility mode for local dev/testing.
- **DBD-02**: Enforce 100% versioned SQL schema migrations via Flyway. Disallow Hibernate `ddl-auto: update` in all profiles (`ddl-auto: validate` mandatory).
- **DBD-03**: Schema migrations: `V1__initial_schema.sql` (core fleet), `V2__user_audit_and_copilot_chat.sql` (audits & chat), `V3__auth_tokens_and_user_lifecycle.sql` (auth tokens, user lifecycle fields, lockouts).
- **DBD-04**: Ensure all foreign keys, unique constraints, and search indexes (`status`, `vehicle_id`, `created_at`, `priority`, `refresh_tokens.token`) are documented and monitored.

## 5. Authentication Requirements
- **AUT-01**: Eliminate frontend hardcoded credentials and auto-login routines from `AuthContext.tsx`.
- **AUT-02**: Implement a formal Login / Logout authentication flow backed by bcrypt password verification and cryptographically signed JWT tokens.
- **AUT-03**: Support JWT token expiration and user account status verification (`enabled: true`).
- **AUT-04**: Separate authentication credentials strictly across Development, Staging, and Production environments via environment variables.
- **AUT-05**: Original FleetIQ Enterprise Authentication UI: Custom, professional single-card layout matching the operations dashboard identity; zero cloning/copying of reference templates; zero decorative waves, blobs, or oversized tablet rounding.
- **AUT-06**: Strict Removal of Security Protocol Marketing Claims: No internal implementation details displayed on UI ("Security Protocol: TLS 1.3 / JWT RBAC", deterministic fallback, internal architecture labels).
- **AUT-07**: Complete Removal of Quick Dev Credentials from Production UI: Dev chips (`Admin`, `Operator`, `Viewer`) purged from production view.
- **AUT-08**: Dual-Token Architecture: Short-lived 15-minute stateless HMAC-SHA256 JWT access token paired with stateful 7-day rotatable refresh token persisted in PostgreSQL.
- **AUT-09**: Stateful Refresh Token Rotation & Revocation: Every exchange via `/api/v1/auth/refresh` immediately revokes the old refresh token and issues a new token pair.
- **AUT-10**: Enterprise Credential Security: BCrypt work factor 12, strict password policy validator (uppercase, lowercase, numbers, special characters), password confirmation check, zero plaintext logging or serialization.
- **AUT-11**: Account Lockout & Brute-Force Defense: 5 consecutive failed login attempts locks account for 15 minutes.
- **AUT-12**: Secure Single-Use Expiring Password Reset: Expiring 1-hour tokens with anti-account-enumeration generic responses; password resets automatically cascade-revoke all active device sessions.
- **AUT-13**: Public Self-Registration Flow: Default restricted `ROLE_VIEWER` role with `email_verified = false`; impossible for clients to assign themselves elevated administrative privileges.
- **AUT-14**: Centralized Frontend Authentication State Machine: Dedicated states (`IDLE`, `AUTHENTICATING`, `AUTHENTICATED`, `ACCOUNT_LOCKED`, `ACCOUNT_DISABLED`, `ERROR`).

## 6. Authorization & RBAC Requirements
- **RBC-01**: Server-side role enforcement on all API routes via Spring Security `@PreAuthorize` or HTTP security filters.
- **RBC-02**: Standardize roles: `ROLE_ADMIN`, `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER`.
- **RBC-03**: Ensure frontend role checks only govern UI visibility; backend security filters remain the authoritative security boundary.
- **RBC-04**: Real-Time Zero-Trust Authorization (0-Second Propagation): `JwtAuthenticationFilter` resolves user entity and role from database on every request; administrative role updates take effect instantaneously.
- **RBC-05**: Real-Time Account Deactivation Revocation: Deactivated users (`enabled = false`) lose access immediately on their next HTTP call with 401 Unauthorized.
- **RBC-06**: Comprehensive RBAC Matrix: Detailed permission mapping and prohibited actions documented in `docs/security/RBAC_MATRIX.md`.

## 7. User Management & Audit Requirements
- **UMG-01**: Dedicated administrative endpoints under `/api/v1/admin/users` restricted to `ROLE_ADMIN`.
- **UMG-02**: Support user operations: list users, search users, create user, deactivate user, reactivate user, update user role, and revoke sessions.
- **UMG-03**: Comprehensive Security Audit Trail (`user_audit_logs`) recording login success/failure, lockouts, registrations, role changes, deactivations, and password resets.
- **UMG-04**: Administrative Audit Inspection API (`/api/v1/admin/users/audit-logs`) and frontend audit trail panel.

## 8. AI Architecture Requirements
- **AID-01**: Establish `AIModelProvider` vendor abstraction decoupling business logic from external LLM providers.
- **AID-02**: Support active providers: `DeterministicFallbackProvider` (active default), `JevModelProvider` (when credentials available), `GeminiModelProvider` / `OpenAiModelProvider` (extensible).
- **AID-03**: AI must act strictly as an analytical reasoning assistant; AI outputs must never bypass deterministic safety constraints.

## 9. Decision Engine Requirements
- **DEC-01**: Maintain the hybrid decision pipeline: Raw Event -> Validation -> Normalization -> Deterministic Rules -> AI Reasoning -> Confidence Validation -> Action Item.
- **DEC-02**: Always record decision provenance (`RULE_ENGINE`, `JEV_AI`, `RULE_ENGINE_FALLBACK`) and confidence scores.
- **DEC-03**: Flag low-confidence (<0.80) or anomalous decisions for mandatory human operator review.

## 10. Security Requirements
- **SEC-01**: Enforce OWASP Top 10 defenses: SQL injection prevention via JPA parameterized queries, XSS sanitization, and strict CORS.
- **SEC-02**: Implement Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **SEC-03**: Never commit secrets, passwords, or private keys to Git. Maintain comprehensive `.gitignore` and `.env.example`.

## 11. Rate Limiting Requirements
- **RAT-01**: Tiered rate limiting: `/api/v1/auth/**` (15 req/min), `/api/v1/assistant/**` (40 req/min), `/api/v1/telemetry/**` (300 req/min), general (600 req/min).
- **RAT-02**: Return HTTP 429 Too Many Requests with standard headers when thresholds are exceeded.

## 12. Testing Requirements
- **TST-01**: Comprehensive test coverage: Unit tests, Spring Boot integration tests, MockMvc API tests, Flyway migration tests, OpenTelemetry tracing tests, and Security & Session integration tests (`AuthenticationAndSessionTests`).
- **TST-02**: Enforce 100% test pass rate (73/73 tests passing) before milestone completion.

## 13. Documentation Requirements
- **DOC-01**: Complete documentation suite under `docs/security/` and `.agent/` covering authentication, RBAC, session management, password policy, account lifecycle, and audit logging.
