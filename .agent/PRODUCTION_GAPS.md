# VEHYRON — Production Readiness & Architectural Gaps Analysis

**Document Version**: 2.0.0  
**Status**: AUDITED — REMEDIATION IN PROGRESS  

---

## 1. Architectural & Security Gaps

| Gap ID | Category | Current State / Defect | Production Target | Planned Remediation |
|---|---|---|---|---|
| **GAP-01** | Auth / RBAC | JWT claims trusted statically without verifying user database state on each request. | Server-authoritative enforcement; instant deactivation and role mutation. | Update `JwtAuthenticationFilter` to query `UserRepository` for `user.isEnabled()` and `user.getRole()`. |
| **GAP-02** | Audit Trail | Authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`) were missing from `user_audit_logs`. | Complete security incident tracking and compliance trail. | Add audit logging in `AuthController` for all login attempts, failures, and logouts. |
| **GAP-03** | Telemetry Stream | SSE stream did not hydrate historical events on mount/refresh, showing an empty "Waiting for simulator" state. | Resilient event stream pre-populated from `/api/v1/dashboard/events`. | Hydrate initial events on frontend mount and merge seamlessly with real-time SSE. |
| **GAP-04** | Navigation | Simulator was exposed as a primary header button alongside core operational actions. | Simulator isolated to developer / testing / secondary tools. | Remove Simulator from `Header.tsx`; keep accessible in secondary navigation for authorized roles. |
| **GAP-05** | UI Clutter | Redundant "Ask AI" button in header duplicating dedicated Copilot workspace. | Single, dedicated AI Copilot workspace. | Remove duplicate header button. |
| **GAP-06** | Data Integrity | Vehicle Table search failed on Make and Model; OEM filter was hardcoded to 4 items. | Full-text client search across all vehicle fields; dynamic OEM catalog. | Expand search predicate with null-safety and dynamically derive OEMs from fleet dataset. |
| **GAP-07** | Visual Design | Critical alerts rendered as giant pink/red panels; high visual noise and fatigue. | Restrained semantic colors; white card surface with red badge indicator. | Refactor `CriticalAlertsBanner.tsx` to clean enterprise design. |
| **GAP-08** | Analytics Layout | Dashboard had vertical fragmentation with widgets awkwardly squeezed into a 1/3 sidebar. | Full-width analytics chart followed by parallel 2-column widget grid. | Refactor `App.tsx` dashboard grid. |
| **GAP-09** | Broken Controls | Fleet Safety donut cut off by overflow mask; 3-dot menus dead; "Show details" button dead. | Fully rendered SVG gauge; active details modal; dead controls eliminated. | Refactor `RightSidebarWidgets.tsx` and wire `SafetyDetailsModal`. |
| **GAP-10** | AI Workspace | Copilot workspace too small, filled with marketing copy and false "Zero-Hallucination" claims. | ChatGPT-style full-bleed interface; collapsible history sidebar; compact chips; `● Grounded` indicator. | Redesign `CopilotWorkspace.tsx`. |
| **GAP-11** | Icon Artifacts | Unshielded SVGs produced text artifacts (`svgAsk AI`, `svgSimulator`) in accessibility tree. | Clean semantic rendering without text leakage. | Add `aria-hidden="true"` to all SVG and Lucide icon elements. |
