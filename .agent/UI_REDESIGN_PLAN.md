# VEHYRON — UI/UX Production Redesign & Hardening Plan

**Version**: 2.0.0  
**Status**: APPROVED FOR EXECUTION  
**Execution Target**: Enterprise Telematics Console, Clean Architecture, Zero Dead Controls  

---

## 1. Architectural Phases & Step-by-Step Milestones

### Phase 1: Header, Navigation & Collapsible Sidebar
- **Header (`Header.tsx`)**:
  - Remove "Simulator" button from primary header (`UI-002`).
  - Remove "Ask AI" duplicate button from primary header (`UI-003`).
  - Remove fake "PRO" marketing badge from header.
  - Simplify "Real-Time Stream" to a clean, subtle `● Live` status indicator in the top-right (`UI-005`).
  - Shield all icons with `aria-hidden="true"` to eliminate SVG text artifacts (`UI-004`).
- **Sidebar (`Sidebar.tsx`)**:
  - Implement collapse/expand toggle button (`w-60` expanded, `w-16` collapsed) (`UI-006`).
  - Display icon + label when expanded; icon only with floating tooltips when collapsed.
  - Maintain clean section groupings (Operations, Intelligence, Governance).
  - Responsive drawer behavior on mobile viewports.

### Phase 2: Dashboard Layout & Widget Remediation
- **Critical Alerts Banner (`CriticalAlertsBanner.tsx`)**:
  - Eliminate oversized emergency-pink background (`UI-001`).
  - Render crisp white card surface with subtle slate border and red accent indicator.
  - Use bold red badge for `CRITICAL` tag and normal dark readable text for issue details.
- **Analytics Dashboard Grid (`App.tsx`)**:
  - Refactor vertical fragmentation (`UI-011`).
  - Render `FleetHealthSection` (Operational Health / Analytics) at full width (`w-full`).
  - Position `Most Day Active` and `Fleet Safety Rate` widgets parallel to each other below analytics in a responsive 2-column grid (`grid grid-cols-1 md:grid-cols-2 gap-6`).
- **Widgets Remediation (`RightSidebarWidgets.tsx`)**:
  - Remove dead 3-dot menus (`UI-007`, `UI-009`).
  - Completely eliminate Card 3 (AI Assistant 3D sphere placeholder) (`UI-022`).
  - Fix Fleet Safety Rate SVG donut: eliminate `overflow-hidden h-24` masking, render responsive circular gauge, bind real safety rate data (`UI-008`).
  - Wire up "Show details" button to open a real Safety & Compliance Details modal (`UI-010`).

### Phase 3: Live Operations Telemetry & Stream Hydration
- **Data Hydration (`useSSE.ts` & `LiveOperationsPanel.tsx`)**:
  - Fetch the last 50 historical events from `GET /api/v1/dashboard/events` upon component mount or refresh (`UI-017`).
  - Prepend incoming real-time SSE events dynamically without wiping existing events.
  - Eliminate "Waiting for incoming vehicle events from simulator..." messaging on refresh.
- **Multi-Field Search**:
  - Expand search beyond `vehicleId` to match fault codes (e.g. `BATTERY_WARNING`, `P0A80`), OEM sources (`TOYOTA`, `TESLA`), severity (`CRITICAL`), and event types (`UI-016`).
- **Header Simplification**:
  - Strip redundant marketing paragraphs explaining SSE and normalization (`UI-024`).

### Phase 4: Vehicle Asset Registry Table & Filters
- **Search Robustness (`VehicleTable.tsx`)**:
  - Add search matching across Vehicle ID, VIN, Model, Make, and Registration with null-safety and case-insensitivity (`UI-018`).
- **Data-Driven OEM Catalog**:
  - Replace hardcoded 4-OEM list with dynamic list derived from active vehicle fleet dataset (`UI-019`).
  - Ensure status dropdown (`Active`, `Inactive`, `Maintenance`) matches uppercase entity status safely.

### Phase 5: AI Copilot Workspace Redesign
- **Workspace Dimensions (`CopilotWorkspace.tsx`)**:
  - Expand conversation area to 100% available viewport width and height (`UI-012`).
  - Add collapsible conversation history sidebar with toggle button (`UI-015`).
- **De-Cluttering & Anti-Pattern Removal**:
  - Strip marketing subtitle ("Multi-OEM telematics correlation...") (`UI-013`).
  - Remove "Zero-Hallucination Guardrails" marketing text; replace with subtle `● Grounded` status indicator (`UI-014`).
  - Convert massive suggested inquiry cards into 3-4 compact clickable chips that disappear once conversation begins (`UI-021`).
  - Clean, contextual citations expandable inside message responses rather than fixed headers.

### Phase 6: Authentication & Real-Time Server RBAC
- **Login Screen (`LoginPage.tsx`)**:
  - Remove "Security Protocol: TLS 1.3 / JWT RBAC" label (`UI-023`).
  - Add clean "Request Access" and "Forgot Password" modal handlers.
- **Server Authorization (`JwtAuthenticationFilter.java`)**:
  - In `JwtAuthenticationFilter`, look up user by username in `userRepository`.
  - Enforce `user.isEnabled()` check on every request (instant deactivation).
  - Use `user.getRole()` as the source of truth for granted authorities (instant role update reflection).
- **Audit Logging (`AuthController.java`)**:
  - Record `LOGIN_SUCCESS`, `LOGIN_FAILURE`, and `LOGOUT` to `user_audit_logs`.

### Phase 7: Verification & Testing
- Run full backend test suite (`mvn test -f backend/pom.xml`).
- Run frontend build verification (`npm run build --prefix frontend`).
- Verify complete user workflows across Admin, Operator, and Viewer.
