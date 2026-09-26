# VEHYRON — Agent Guide

This project follows the shared **agent-compass** contract.

- Read `docs/agent-compass/AGENTS.md` first — it is the canonical agent contract.
- Guidelines: `docs/agent-compass/docs/guidelines/` · Architecture: `docs/agent-compass/docs/architecture/` · Tooling: `docs/agent-compass/docs/tooling/`
- Skills: `.agents/skills/` · Templates: `docs/agent-compass/templates/`
- Knowledge: `docs/agent-compass/knowledge/` — instincts and worked examples.

Add project-specific conventions below this line; they take precedence over the agent-compass baseline on conflict.

---

## 1. AI Startup & Session Workflow

Every new VEHYRON engineering session must follow this targeted retrieval sequence:

1. **Read AGENTS.md**: Understand mandatory guardrails, safety protocols, and quality gates.
2. **Read Project Context**: Inspect `.agent/PROJECT_CONTEXT.md` for foundational domain goals.
3. **Read Current State**: Inspect `.agent/CURRENT_STATE.md` for active milestones, blockers, and recent changes.
4. **Inspect Relevant Architecture**: Consult `.agent/ARCHITECTURE.md` and `docs/architecture/repo-map.md`.
5. **Query Codebase Memory**: Utilize Codebase Memory MCP (`query_graph`, `search_graph`, `get_architecture`) to inspect classes, call graphs, routes, and dependencies.
6. **Identify Relevant Architect Skill**: Load only the specific skill needed from `.agents/skills/` (do NOT load all skills at once):
   - `architecture-principles` (Core design invariants, separation of concerns)
   - `architecture-decision-framework` (Trade-off evaluation, ADR authoring)
   - `database-intelligence` (PostgreSQL, schema indexing, JPA entity modeling)
   - `api-domain-architecture` (REST conventions, multi-OEM canonical schemas)
   - `scalability-distributed-systems` (Event processing throughput, backpressure, SSE)
   - `ai-system-architecture` (Decision engine abstraction, deterministic fallback)
   - `context-engineering` (RAG grounding, prompt contracts, token optimization)
   - `security-by-design` (RBAC, JWT validation, SQL injection defense, secret hygiene)
   - `codebase-architecture` (Package structures, dependency boundaries)
   - `production-engineering` (Reliability, health checks, metrics, tracing)
   - `architecture-review` (Pre-merge checklists, architectural sanity validation)
7. **Inspect Relevant ADRs**: Review decisions in `docs/decisions/` and `.agent/DECISIONS.md`.
8. **Understand the Task**: Define exact problem statement, boundary conditions, and acceptance criteria.
9. **Plan**: Formulate explicit step-by-step changes, verifying affected modules, APIs, and schemas.
10. **Implement**: Code defensively adhering to domain boundaries and concurrency safety.
11. **Test**: Execute unit tests, integration tests, and deterministic fallback verification.
12. **Review**: Audit changed diffs, verify static analysis, and validate security hygiene.
13. **Update Project Knowledge**: Record architectural decisions in `.agent/DECISIONS.md` and state transitions in `.agent/CURRENT_STATE.md`.

*Note: Do NOT read every document on every request. Practice targeted, relevant retrieval.*

---

## 2. Pre-Coding Rules (Before Coding)

Before touching or writing any application code, the agent must:
1. **Understand the Requirement**: Clearly delineate functional expectations, non-functional requirements, and constraints.
2. **Inspect Existing Architecture**: Verify how existing services interact (`backend/src/main/java/com/fleetiq/` and `frontend/src/`).
3. **Inspect Relevant Code**: Read existing implementation files, interfaces, and unit tests.
4. **Query Codebase Intelligence**: Query Codebase Memory MCP to discover call relationships, callers, implementations, and dependencies.
5. **Inspect Relevant Project Memory**: Check `.agent/` knowledge items for prior findings and constraints.
6. **Inspect Relevant ADRs**: Ensure alignment with established architectural decisions in `docs/decisions/`.
7. **Identify Affected Modules**: Check backend services, controllers, models, frontend components, and simulator.
8. **Identify Database/API/Domain Implications**: Check JPA entities, migration impact, REST schemas, and canonical event models.
9. **Consider Security & Concurrency**: Validate auth policies, transaction boundaries, thread safety, and event ordering.
10. **Design Before Implementing**: Solidify the approach, contracts, and fallbacks prior to execution.

---

## 3. Implementation Rules (During Implementation)

During code modification, the agent must:
- **Follow Existing Architecture**: Maintain the layered Spring Boot + React/TypeScript architecture.
- **Avoid Unnecessary Technologies**: Do not introduce unvetted libraries, heavy dependencies, or extraneous frameworks.
- **Preserve Domain Boundaries**: Keep OEM-specific normalization decoupled from downstream canonical decision processing.
- **Maintain Backward Compatibility**: Ensure API endpoints and data models do not break existing UI clients or simulator flows.
- **Write Tests**: Provide JUnit 5 + Mockito tests for backend features and verify frontend functionality.
- **Handle Failures Explicitly**: Never swallow exceptions; provide deterministic fallback mechanisms when AI decisions fail or time out.
- **Validate Inputs**: Enforce validation on incoming OEM events, simulator payloads, and API requests.
- **Consider Transactions**: Apply `@Transactional` purposefully with appropriate propagation and isolation levels.
- **Consider Idempotency**: Ensure duplicate incoming vehicle events or telemetry payloads do not corrupt state or trigger duplicate actions.
- **Consider Concurrency**: Prevent race conditions when updating vehicle status, prioritization queues, or SSE broadcasts.
- **Maintain Observability**: Log structured events with contextual metadata (VIN, eventId, tenantId), avoiding raw unformatted logging.
- **Avoid Hardcoded Secrets**: Load all API keys, database credentials, and JWT secrets strictly from environment variables or external configuration.
- **Document Decisions**: Formulate ADRs for significant structural, data, or algorithmic shifts.

---

## 4. Pre-Finishing Rules (Before Finishing)

Before declaring a task complete, the agent must:
1. **Run Relevant Tests**: Execute `mvn test -f backend/pom.xml` and verify all tests pass.
2. **Run Static Analysis & Build Validation**: Verify compilation and packaging (`mvn package -DskipTests` and `npm run build --prefix frontend`).
3. **Check Database Migrations**: Ensure schema changes remain compatible with PostgreSQL / Flyway conventions.
4. **Check API Compatibility**: Verify that REST payloads, SSE event streams, and DTO structures align with frontend expectations.
5. **Check Security Implications**: Ensure endpoints are properly secured with Spring Security annotations and input sanitization.
6. **Check Observability**: Verify log formats, error tracking, and health metrics.
7. **Review Changed Files**: Inspect `git status` and `git diff` to ensure no stray files, accidental formatting noise, or secret leaks.
8. **Update Project Documentation**: Update technical specifications or architecture diagrams if contracts changed.
9. **Update Project Memory**: When significant decisions or state changes occur, update `.agent/DECISIONS.md` and `.agent/CURRENT_STATE.md`.
10. **Report Exactly What Changed and What Was Verified**: Provide a concise summary of modified components, tests executed, and validation results.

---

## 5. Project Memory Maintenance Rules

The agent must maintain project intelligence without bloat:
- **Significant Decision Made**: Record context, options, decision, and consequences in `.agent/DECISIONS.md` and `docs/decisions/`.
- **Project State Changes**: Update `.agent/CURRENT_STATE.md` with milestone status, active components, and current blockers.
- **Domain Understanding Updates**: Refine `.agent/DOMAIN_KNOWLEDGE.md` when new OEM event types, rules, or priority models are established.
- **Architecture Changes**: Update `.agent/ARCHITECTURE.md` when boundaries, layers, or integrations evolve.
- **Session Progress**: Log notable milestones or architectural transitions in `.agent/SESSION_LOG.md`.
- *Do not create unnecessary memory entries for trivial or minor cosmetic updates.*
