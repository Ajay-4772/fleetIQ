# VEHYRON — UI/UX Architectural Decisions Record (Batch 1)

**Status**: ACTIVE & CANONICAL  
**Rule**: Decisions recorded here govern this batch and all future batches (Batch 2, Batch 3, etc.). Do not regress or undo these decisions in future phases.

---

### Decision ADR-UI-001: Separation of Severity Accent from Card Container
- **Context**: The existing Critical Operations Alert cards applied `bg-rose-50/60` and `border-rose-200` to the entire card area, overwhelming the screen with red/pink.
- **Decision**: The card container must be neutral white (`bg-white border-slate-200/80`). The severity color belongs strictly to:
  1. The severity badge (`bg-rose-600 text-white`).
  2. A minimal accent (e.g. `border-l-4 border-l-rose-600` or status dot).
  3. Content text must remain high-contrast dark slate (`text-slate-900` / `text-slate-700`).
- **Consequences**: Drastically lower visual fatigue, improved scannability, and alignment with modern enterprise design systems.

---

### Decision ADR-UI-002: Isolation of Developer Tools from Primary Navigation
- **Context**: "Simulator" was placed in the top navigation header beside operational search and user profile.
- **Decision**: Remove "Simulator" from the primary header. Telematics scenario simulation is a developer and testing tool. Access is retained in secondary navigation (`Sidebar` under `OPERATIONAL TOOLS` or Admin settings) strictly for authorized roles (`ROLE_ADMIN`, `ROLE_OPERATIONS_LEAD`).
- **Consequences**: Protects production operators from accidental simulation triggers and eliminates confusion between synthetic events and live telemetry.

---

### Decision ADR-UI-003: Deduplication of AI Entry Points
- **Context**: Both an "Ask AI" button in the top header and an "AI Copilot" tab in the sidebar were present.
- **Decision**: Remove the "Ask AI" top navigation button. The primary navigation should not contain duplicate entry points. The dedicated full-page `AI Copilot` workspace serves as the primary conversational interface.
- **Consequences**: Cleaner top header, predictable single-path navigation for users.

---

### Decision ADR-UI-004: Shielding of SVG Icons Against Assistive Tree Text Leakage
- **Context**: Screen readers and headless snapshot engines exposed strings such as `svgAsk AI` and `svgSimulator`.
- **Decision**: Every SVG element and Lucide icon must include `aria-hidden="true"`. Icon buttons must provide accessible descriptions via `title` and `aria-label` attributes.
- **Consequences**: Zero text artifacts in accessibility trees and DOM snapshots.

---

### Decision ADR-UI-005: Dual-Mode Collapsible Navigation Sidebar
- **Context**: The sidebar was fixed at 240px (`w-60`), restricting horizontal workspace on laptops and tablets.
- **Decision**: Implement a collapsible sidebar with two discrete states:
  - **Expanded (`w-60`)**: Shows group headings, icon, label, and counter badge.
  - **Collapsed (`w-16`)**: Shows icon only, center-aligned, with native floating tooltips.
  - Provide a toggle control with keyboard accessibility and smooth width transitions (`transition-all duration-200`).
- **Consequences**: Maximizes data visualization area on tables, AI Copilot, and analytics charts.

---

### Decision ADR-UI-006: Server-Authoritative Instant RBAC Enforcement
- **Context**: JWT tokens held user roles statically for 24 hours, meaning deactivated users or demoted operators retained privileges until token expiration.
- **Decision**: `JwtAuthenticationFilter` queries `UserRepository` for the live `user.isEnabled()` state and current `user.getRole()`.
- **Consequences**: Real-time deactivation and role mutations take effect on the very next HTTP request without waiting for token expiry.

---

### Decision ADR-UI-007: Full-Width Analytics with Parallel Dual-Widget Grid
- **Context**: The Overview page crammed widgets into a 1/3 sidebar column beside the Fleet Health curve.
- **Decision**: Restructure the dashboard:
  1. Top: KPI Summary Cards.
  2. Full Width: Fleet Operational Health & Duty Cycle curve (`w-full`).
  3. Lower Grid: `Most Day Active` (utilization) and `Fleet Safety Rate` (gauge) parallel in a responsive 2-column grid (`grid grid-cols-1 md:grid-cols-2 gap-6`).
- **Consequences**: Eliminates vertical fragmentation and aligns with the target enterprise dashboard specifications.
