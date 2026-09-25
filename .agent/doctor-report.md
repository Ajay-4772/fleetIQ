# Agent Readiness Report

Root: `C:\Users\ajaya\Desktop\fleetiq`

## Required

| Check | Status | Detail |
| ----- | ------ | ------ |
| shared agent config has no local absolute path leaks | issue | AGENTS.md, CLAUDE.md, CODEX.md, GEMINI.md, .github\copilot-instructions.md |
| projectmem MCP example avoids local absolute paths | ok |  |
| .gitignore ignores regenerated projectmem projections | ok |  |
| .gitattributes gives the projectmem event log a union merge driver | ok |  |
| .prettierignore ignores generated projectmem files | ok |  |
| existing .husky/pre-commit executable | issue |  |
| existing .husky/pre-push executable | issue |  |
| existing .husky/commit-msg executable | issue |  |

## Optional Workflows

| Check | Status | Path |
| ----- | ------ | ---- |
| Specs | ok | `specs/README.md` |
| Constitution | ok | `specs/constitution.md` |
| Project memory | ok | `.projectmem/README.md` |
| MCP docs | ok | `.mcp/README.md` |
| Repo map | ok | `docs/architecture/repo-map.md` |
| ADR template | ok | `docs/decisions/000-template.md` |

## Advisory

| Check | Status | Detail |
| ----- | ------ | ------ |
| codebase-memory not selected — optional structural code intelligence (agent-compass code-intel setup) | ok |  |
| AGENTS.md exists | ok |  |
| AGENTS.md points at agent-compass | ok |  |
| agent-compass.commands.json exists | ok |  |
| projectmem docs exist | ok |  |
| projectmem MCP example exists | ok |  |
| package.json has "prepare": "husky" | issue |  |
| .gitmodules mentions agent-compass when present | ok |  |
| CLAUDE.md exists | ok |  |
| CODEX.md exists | ok |  |
| GEMINI.md exists | ok |  |
| .github/copilot-instructions.md exists | ok |  |
| CLAUDE.md points at AGENTS.md | ok |  |
| CODEX.md points at AGENTS.md | ok |  |
| GEMINI.md points at AGENTS.md | ok |  |
| .github/copilot-instructions.md points at AGENTS.md | ok |  |
| .husky/pre-commit exists | ok |  |
| .husky/pre-push exists | ok |  |
| .husky/commit-msg exists | ok |  |
| specs/README.md exists | ok |  |
| specs/constitution.md exists | ok |  |
| docs/architecture/repo-map.md exists | ok |  |
| docs/decisions/000-template.md exists | ok |  |
| .github/PULL_REQUEST_TEMPLATE.md exists | ok |  |
| .github/instructions/agent-compass.instructions.md exists | ok |  |
| .github/instructions/pr-workflow.instructions.md exists | ok |  |
| .github/prompts/explain-project.prompt.md exists | ok |  |
| .github/prompts/prompt-upgrade.prompt.md exists | ok |  |
| .github/agents/agent-compass-teacher.agent.md exists | ok |  |
| .codex/config.toml exists | ok |  |
| .codex/hooks.json exists | ok |  |
| .claude/agents/reviewer.md exists | ok |  |
| .claude/agents/security.md exists | ok |  |
| .claude/agents/docs-teacher.md exists | ok |  |
| .claude/agents/architecture-advisor.md exists | ok |  |
| .github/agents/architecture-advisor.agent.md exists | ok |  |
| .github/prompts/choose-architecture.prompt.md exists | ok |  |
| .claude/settings.example.json exists | ok |  |
| .agent/provider-discovery-smoke.md exists | ok |  |
| .agent/provider-verification.md exists | ok |  |
| .agent/recommendations.md exists | ok |  |
| .agent/quality-gates.md exists | ok |  |
| .agent/migration-plan.md exists | ok |  |
| .agent/mcp-readiness.md exists | ok |  |
| .agent/spec-validation-map.md exists | ok |  |
| .agent/failure-mining.md exists | ok |  |
| .agent/report.html exists | ok |  |
| .mcp/README.md exists | ok |  |
| .mcp/figma.example.json exists | ok |  |
| .mcp/copilot-cloud.example.json exists | ok |  |
| .mcp/codex.example.toml exists | ok |  |
| .mcp/angular-cli.example.json exists | ok |  |
| .mcp/gemini.example.json exists | ok |  |
| .gemini/settings.example.json exists | ok |  |
| .mcp/headroom.example.json exists | ok |  |
| .mcp/recommended.example.json exists | ok |  |
| .mcp/codebase-memory.example.json exists | ok |  |
| .mcp/tool-contract.md exists | ok |  |
| .agent/agent-compass.lock exists (run sync to update) | ok |  |

## Package Scripts

- none
