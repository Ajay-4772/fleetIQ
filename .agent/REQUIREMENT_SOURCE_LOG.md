# FleetIQ — Requirement Source Log

**Version**: 1.0.0  
**Context Tracking**: Historical Prompt & Master Directives  
**Last Updated**: September 25, 2026

---

## 1. Requirement Origin Log

| Directive Reference | Originating Request / Phase | Core Requirements Synthesized |
| :--- | :--- | :--- |
| **SRC-01** | Production Readiness Master Directive | Conduct evidence-based system audit without assumptions. Classify all capabilities as IMPLEMENTED, PARTIALLY IMPLEMENTED, DEMO/MOCK, HARDCODED, or MISSING. |
| **SRC-02** | Security & Auth Remediation | Remove frontend-only fake authentication and hardcoded demo credentials in `AuthContext.tsx`. Implement real login/logout, password hashing, and user status validation. |
| **SRC-03** | User Management & RBAC | Implement administrative portal for managing users (list, search, create, deactivate, reactivate, assign roles). Enforce RBAC authoritatively on the backend. |
| **SRC-04** | AI & JEV Verification | Audit JEV and TypeSpace in codebase. Factually verify runtime configuration and declare fallback state when keys are absent. Create vendor-neutral `AIModelProvider` abstraction. |
| **SRC-05** | Hybrid Decision Engine | Preserve deterministic business rules as authoritative constraints for vehicle safety. AI assists with contextual reasoning, explanation, and maintenance recommendations. |
| **SRC-06** | RAG Architecture | Define exact purpose of RAG: contextual grounding using OEM service manuals, diagnostic codes, and operating policies. Enforce document access controls and citations. |
| **SRC-07** | Rate Limiting & Input Validation | Protect sensitive endpoints against brute-force attacks (`/api/v1/auth/login`) and volumetric abuse (`/api/v1/events/ingest`, `/api/v1/assistant/query`). Validate all inputs server-side. |
| **SRC-08** | Global Error Handling | Replace ad-hoc per-controller try-catch logic with `@ControllerAdvice` returning consistent, sanitized error payloads with request trace IDs. |
| **SRC-09** | AI Copilot Full-Page Experience | Eliminate the AI side drawer modal (`AiAssistantModal.tsx`). Implement dedicated ChatGPT-style page (`/intelligence/copilot`) with persistent history and user isolation. |
| **SRC-10** | UI Animation Remediation | Remove distracting 3D blue glowing orb animation and pulsating radio lighting from `index.css` and `RightSidebarWidgets.tsx`. Enforce clean, restrained enterprise styling. |
| **SRC-11** | IDE Independence | Ensure FleetIQ is completely independent of Antigravity. Enable full development and maintenance in VS Code, IntelliJ IDEA, and GitHub Codespaces via DevContainer. |
| **SRC-12** | Docker & CI/CD | Provide multi-stage Docker builds, `docker-compose.yml` local orchestration, and GitHub Actions CI pipeline (`.github/workflows/ci.yml`) enforcing automated test verification. |
| **SRC-13** | Scalability & Load Balancing | Analyze system capacity, database connection pooling, statelessness, and horizontal scaling. Document load testing plan across burst ingestion and concurrent queries. |
| **SRC-14** | Public & System Pages | Implement complete web application surface including dedicated routes for `/` (Landing), `/login`, `/404`, `/401`, `/403`, `/500`, and `/maintenance`. |
| **SRC-15** | Legal & Compliance Templates | Create `/terms`, `/privacy`, and `/cookies` placeholder templates clearly marked `LEGAL REVIEW REQUIRED`. |
| **SRC-16** | Company Handover Package | Create complete handover suite under `docs/HANDOVER/` covering ownership transfer, company-owned credentials, third-party services, billing, runbooks, and disaster recovery. |

---

## 2. Invariant Engineering Principles
1. **Repository is the Source of Truth**: All architecture decisions, domain schemas, runbooks, and configurations live directly in the Git repository.
2. **Never Fabricate Capabilities**: If an external LLM or cloud resource is unconfigured, factually report deterministic fallback or `NOT VERIFIED LOCALLY`.
3. **Deterministic Safety Authoritative**: AI models generate recommendations and narrative explanations; deterministic rules enforce hard operational constraints.
4. **Zero Domain Logic Regression**: Every architectural improvement must preserve 100% backend test pass rates and clean frontend build verification.
