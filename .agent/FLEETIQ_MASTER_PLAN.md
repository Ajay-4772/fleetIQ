# VEHYRON — Master Implementation & Handover Plan

**Document Version**: 1.0.0  
**Status**: APPROVED ROADMAP  
**Author**: Principal Software Architect & Lead Systems Engineer  
**Last Updated**: September 25, 2026

---

## Roadmap Overview

This master plan transitions VEHYRON from a prototype/demo into a secure, reproducible, enterprise-ready software product prepared for independent company ownership. The plan is organized into controlled, sequential phases designed to preserve existing domain functionality while addressing all production gaps.

---

## Phase Breakdown

### Phase 0: Discovery, System Audit & Governance (COMPLETED)
- [x] Full repository audit and evidence-based capability classification (`.agent/CURRENT_SYSTEM_AUDIT.md`).
- [x] Verification of JEV/TypeSpace and AI Copilot reality.
- [x] Master Requirements Specification (`.agent/MASTER_REQUIREMENTS.md`).
- [x] Requirement Traceability Matrix (`.agent/REQUIREMENT_TRACEABILITY.md`).
- [x] Requirement Source Log (`.agent/REQUIREMENT_SOURCE_LOG.md`).
- [x] Master Plan and Execution Tracker established.

---

### Phase 1: Backend Security Hardening, Error Handling & Rate Limiting
- **Goal**: Protect the application edge, eliminate stack trace leakage, and prevent volumetric DoS attacks.
- **Tasks**:
  1. Implement `GlobalExceptionHandler.java` (`@ControllerAdvice`) providing standardized, sanitized API error responses with trace IDs (`X-Trace-Id`).
  2. Implement `RateLimitingFilter.java` enforcing request thresholds on `/api/v1/auth/login` (5 req/min), `/api/v1/assistant/query` (30 req/min), and `/api/v1/events/ingest` (100 req/sec).
  3. Validate bean constraints and parameter bounds across all REST endpoints.
  4. Write automated integration tests for error handling and rate limiting.

---

### Phase 2: Production Authentication, RBAC & Admin User Management API
- **Goal**: Eliminate hardcoded demo authentication, implement secure user management, and enforce server-side RBAC.
- **Tasks**:
  1. Create `AdminUserController.java` (`/api/v1/admin/users`) with `ROLE_ADMIN` enforcement.
  2. Implement user management operations: list users, search users, create user, toggle active/disabled state, and update roles.
  3. Create `UserAuditLog` entity and repository to record administrative actions.
  4. Enhance `SecurityConfig.java` to protect admin routes and allow self-profile management (`/api/v1/auth/me`).
  5. Write automated unit and integration tests for user management and RBAC.

---

### Phase 3: Database Migration V2 (User Audit & AI Chat History)
- **Goal**: Maintain strict Flyway versioning for new database entities while upholding Hibernate `ddl-auto: validate`.
- **Tasks**:
  1. Author `backend/src/main/resources/db/migration/V2__user_audit_and_copilot_chat.sql`.
  2. Define tables:
     - `user_audit_logs` (admin action logging).
     - `chat_conversations` (user-isolated conversation threads).
     - `chat_messages` (multi-turn query/response history, citations, sources, confidence, provider).
  3. Define JPA entities: `UserAuditLog`, `ChatConversation`, `ChatMessage`.
  4. Verify Flyway executes cleanly and Hibernate validates schema compatibility with zero errors.

---

### Phase 4: AI Architecture & Vendor-Neutral Provider Abstraction
- **Goal**: Decouple business logic from external AI vendors, support deterministic fallback, and persist multi-turn Copilot conversations.
- **Tasks**:
  1. Define `AIModelProvider.java` interface.
  2. Implement `DeterministicFallbackProvider.java` (default grounded synthesizer).
  3. Refactor `JevDecisionService.java` to implement provider contracts with safe fallback.
  4. Implement `CopilotChatService.java` managing user-isolated conversation threads, message persistence, and RAG knowledge retrieval.
  5. Expose REST endpoints under `/api/v1/assistant/conversations`.

---

### Phase 5: Frontend Transformation & UI Remediation
- **Goal**: Remove demo side-modals, eliminate distracting animations, implement dedicated full-page Copilot, and provide real login/admin flows.
- **Tasks**:
  1. **Animation Removal**: Strip 3D blue glowing orb (`animate-orb`), blue drop-shadows, and pulsating rings from `index.css` and `RightSidebarWidgets.tsx`.
  2. **Dedicated AI Copilot Page**: Create `CopilotWorkspace.tsx` resembling a professional ChatGPT-style interface with conversation history, new chat, renaming, citations, and evidence panels.
  3. **Remove Side Modal**: Eliminate `AiAssistantModal.tsx` and integrate the copilot directly into main navigation.
  4. **Production Authentication UI**: Remove hardcoded demo auto-login from `AuthContext.tsx`. Create real `LoginPage.tsx` with credential entry, error states, and session persistence.
  5. **Admin Portal UI**: Create `UserManagementPanel.tsx` in System tab for authorized administrators.
  6. **Public & System Pages**: Create components for 404 Not Found, 401/403 Access Denied, 500 Server Error, Maintenance Mode, Terms of Service, Privacy Policy, and Cookie Policy.

---

### Phase 6: DevOps, Reproducible Dev Environment & CI/CD
- **Goal**: Make the repository 100% reproducible and independent of Antigravity or any personal laptop.
- **Tasks**:
  1. Create `.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile` supporting VS Code and GitHub Codespaces.
  2. Create GitHub Actions CI pipeline (`.github/workflows/ci.yml`) running backend tests, frontend builds, and Docker validation on PRs.
  3. Update `.env.example` and `.gitignore` with strict secret hygiene.

---

### Phase 7: Comprehensive Architecture, Operations & Handover Documentation
- **Goal**: Equip the company engineering team to operate, scale, troubleshoot, and maintain VEHYRON independently.
- **Tasks**:
  1. Author `docs/architecture/SCALABILITY.md` (workload capacity, horizontal scaling, bottleneck analysis).
  2. Author security docs: `docs/security/AUTHENTICATION.md`, `docs/security/RBAC.md`, `docs/security/RATE_LIMITING.md`, `docs/security/SECURITY_ARCHITECTURE.md`.
  3. Author AI/RAG docs: `docs/ai/AI_ARCHITECTURE.md`, `docs/ai/RAG_ARCHITECTURE.md`.
  4. Author operations docs: `docs/operations/ERROR_HANDLING.md`, `docs/operations/DISASTER_RECOVERY.md`, `docs/operations/MONITORING.md`.
  5. Author testing docs: `docs/testing/LOAD_TESTING.md`, `docs/testing/TESTING_STRATEGY.md`.
  6. Author complete `docs/HANDOVER/` suite (15 canonical handover guides).
  7. Author legal templates: `docs/legal/TERMS_AND_CONDITIONS.md`, `docs/legal/PRIVACY_POLICY.md`, `docs/legal/COOKIE_POLICY.md`.

---

### Phase 8: Final Verification & Handover Readiness Report
- **Goal**: Rigorous pre-finishing quality audit and formal reporting.
- **Tasks**:
  1. Run full backend test suite (`mvn test -f backend/pom.xml`) -> Verify 100% pass rate.
  2. Run frontend production build (`npm run build --prefix frontend`) -> Verify zero errors.
  3. Run static analysis and secret scan.
  4. Author `.agent/FLEETIQ_PRODUCTION_READINESS_REPORT.md` and `.agent/FLEETIQ_HANDOVER_READINESS_REPORT.md`.
