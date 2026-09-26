# VEHYRON — Gemini Agent Guide

Read `docs/agent-compass/AGENTS.md` first. It is the canonical agent-compass contract.

Host project `AGENTS.md` takes precedence when it adds project-specific rules.

## AI Session Startup Workflow
Always review the 13-step startup workflow defined in `AGENTS.md`:
1. Read `AGENTS.md`
2. Read `.agent/PROJECT_CONTEXT.md`
3. Read `.agent/CURRENT_STATE.md`
4. Inspect relevant architecture (`.agent/ARCHITECTURE.md`)
5. Query codebase memory via Codebase Memory MCP (`search_graph`, `query_graph`, `get_architecture`)
6. Identify relevant Architect Skill in `.agents/skills/`
7. Inspect relevant ADRs in `docs/decisions/` and `.agent/DECISIONS.md`
8. Understand the task
9. Plan
10. Implement defensively
11. Test thoroughly
12. Review diffs and security
13. Update project knowledge

Consult `.agents/skills/` before significant architectural or implementation decisions.
Do NOT load every skill into context for every task; use targeted retrieval.
