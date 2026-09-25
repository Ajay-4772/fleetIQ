# Agent Compass Recommendations

Root: `C:\Users\ajaya\Desktop\fleetiq`

Detected: React app

## Recommended Actions

- Apply a policy pack with `agent-compass policy-pack . --apply solo-dev|startup-fast|strict-enterprise|regulated-api`.
- Add design-system docs before UI-heavy work; use Figma MCP when Figma is source of truth.
- Install backoffice path instructions: `mkdir -p .github/instructions && cp docs\agent-compass\templates\agent\.github\instructions\backoffice.instructions.md .github/instructions/` (adjust the `applyTo` glob if the app is not in `apps/backoffice`).
- Add a single `check` script or fill lint/typecheck/test registry entries.
- `codebase-memory-mcp` not configured. Recommended for large or multi-module repositories to reduce broad agent exploration: run `agent-compass code-intel setup`.

## Fit-Based Assets

Only what matches this project — core plus detected stacks (see
`scripts/lib/profiles.mjs`).

- Skills: gen-docs, verify-module, verify-quality, verify-change, verify-security, spec-workflow, project-memory, pr-workflow, pr-review-governance, debug-loop, agent-teacher, architecture-advisor, adr-from-meeting, codebase-to-specs, long-running-task, progress-audit, completion-plan, work-splitting, implementation-planning, convert-documents-to-markdown, impact-analysis, delivery-digest, harvest-questions, split-tasks-by-profile, spec-to-tickets, spec-drift-triage, qa-review-pass, diagram-to-adr, diagram-to-likec4, likec4-to-openspec, react-admin-dashboard-patterns, figma-mcp-frontend, figma-tokens-to-designmd, design-taste-skills, ai-native-ui-patterns, visual-regression-playwright, high-end-visual-design, minimalist-ui, redesign-existing-projects

  ```bash
  agent-compass skills-sync . --only gen-docs,verify-module,verify-quality,verify-change,verify-security,spec-workflow,project-memory,pr-workflow,pr-review-governance,debug-loop,agent-teacher,architecture-advisor,adr-from-meeting,codebase-to-specs,long-running-task,progress-audit,completion-plan,work-splitting,implementation-planning,convert-documents-to-markdown,impact-analysis,delivery-digest,harvest-questions,split-tasks-by-profile,spec-to-tickets,spec-drift-triage,qa-review-pass,diagram-to-adr,diagram-to-likec4,likec4-to-openspec,react-admin-dashboard-patterns,figma-mcp-frontend,figma-tokens-to-designmd,design-taste-skills,ai-native-ui-patterns,visual-regression-playwright,high-end-visual-design,minimalist-ui,redesign-existing-projects
  ```

- Templates: `templates/specs`, `templates/intake`, `templates/commands`, `templates/design-system`, `templates/eslint`
- Docs to point agents at: `docs/guidelines/coding-style.md`, `docs/guidelines/testing-tdd.md`, `docs/guidelines/documentation.md`
