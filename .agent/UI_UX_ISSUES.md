# VEHYRON — UI/UX Issues & Tracking Register (Batch 1)

**Audit Batch**: 1  
**Status**: COMPLETED & VERIFIED  
**Allowed Issue Statuses**: `DISCOVERED`, `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `TESTING`, `VERIFIED`, `BLOCKED`  

---

### Issue UI-001
- **Page**: Overview / Dashboard
- **Component**: `CriticalAlertsBanner.tsx`
- **Current Behavior**: Card rendered with `bg-rose-50/60` and `border-rose-200` covering entire card area.
- **Problem**: Excessive emergency-pink color causes eye fatigue and violates enterprise design standards.
- **Expected Behavior**: Clean white card surface with subtle slate border and red accent indicator. Severity badge carries the red color.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Card container redesigned with `bg-white border-slate-200/80 shadow-2xs`, dark text, and subtle red left accent border. Red color is confined to the `CRITICAL` pill badge.
- **Verification Status**: VERIFIED (Verified in `dashboard_overview_batch1_verified.png`).

### Issue UI-002
- **Page**: Global / Header
- **Component**: `Header.tsx`
- **Current Behavior**: "Simulator" button rendered in primary navigation header.
- **Problem**: Scenario simulation is a developer/testing tool, not a primary operational action.
- **Expected Behavior**: Remove from primary header navigation; maintain access in secondary tools / Admin area.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Removed Simulator button from `Header.tsx`. Isolated under `Testing Tools` in `Sidebar.tsx` with role-based guard for `ROLE_ADMIN` and `ROLE_OPERATIONS_LEAD`.
- **Verification Status**: VERIFIED (Verified in `dashboard_overview_batch1_verified.png`).

### Issue UI-003
- **Page**: Global / Header
- **Component**: `Header.tsx`
- **Current Behavior**: "Ask AI" button in primary header bar.
- **Problem**: Duplicate AI entry point; dedicated AI Copilot tab already exists in navigation.
- **Expected Behavior**: Remove "Ask AI" from primary header.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Removed "Ask AI" button from `Header.tsx`. Primary AI access is centralized in the full-page `AI Copilot` workspace.
- **Verification Status**: VERIFIED (Verified in `dashboard_overview_batch1_verified.png`).

### Issue UI-004
- **Page**: Global
- **Component**: SVG / Lucide Icons
- **Current Behavior**: Text artifacts like `svgAsk AI`, `svgSimulator`, `svgZero-Hallucination Guardrails` leak into accessibility snapshots.
- **Problem**: SVGs unshielded without `aria-hidden="true"`, causing screen readers and tools to serialize "svg" followed by text.
- **Expected Behavior**: Shield all SVG/icon elements with `aria-hidden="true"` and accessible labels.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Added `aria-hidden="true"` to Lucide icon components across `Header`, `Sidebar`, `LiveOperationsPanel`, `CopilotWorkspace`, and modal components.
- **Verification Status**: VERIFIED (Verified in accessibility snapshots).

### Issue UI-005
- **Page**: Global / Header
- **Component**: `Header.tsx`
- **Current Behavior**: "Real-Time Stream" rendered as a large animated pill in header.
- **Problem**: Visually too prominent; wastes navigation space.
- **Expected Behavior**: Compact `● Live` status indicator in the top-right.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Replaced large pill with compact `● Live` badge (emerald pulse indicator with subtle slate border and font-semibold text).
- **Verification Status**: VERIFIED (Verified in `dashboard_overview_batch1_verified.png`).

### Issue UI-006
- **Page**: Global / Navigation
- **Component**: `Sidebar.tsx`
- **Current Behavior**: Sidebar width fixed at 240px with no toggle control.
- **Problem**: Inflexible layout for varied display sizes; cannot maximize operational table/chat space.
- **Expected Behavior**: Responsive collapsible sidebar with `Expanded` (`w-60`) and `Collapsed` (`w-16`) states.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Built collapsible toggle mechanism (`isCollapsed`, `onToggleCollapse`) with keyboard accessibility, hover tooltips, and seamless grid resizing.
- **Verification Status**: VERIFIED (Verified in `sidebar_collapsed_verified.png`).

### Issue UI-007
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx` (Most Day Active)
- **Current Behavior**: Three-dot menu button present with no click handler or actions.
- **Problem**: Dead UI element violating enterprise usability requirements.
- **Expected Behavior**: Remove dead three-dot menu and replace with functional peak badge.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Removed dead three-dot menu; added active peak indicator `Peak: Tue (8,162 km)` and interactive day selection tooltips.
- **Verification Status**: VERIFIED (Verified in `dashboard_lower_widgets_verified.png`).

### Issue UI-008
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx` (Fleet Safety Rate)
- **Current Behavior**: Donut/ring visualization hidden or broken due to zero dimensions.
- **Problem**: Sizing/SVG viewport calculation missing circumference stroke styling.
- **Expected Behavior**: Responsive circular SVG donut gauge rendering live compliance score.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Engineered responsive SVG circular progress gauge (`r=54`, `strokeDasharray=339.29`, `strokeDashoffset=40.71`) centered with bold percentage and `Nominal` badge.
- **Verification Status**: VERIFIED (Verified in `safety_donut_verified.png`).

### Issue UI-009
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx` (Fleet Safety Rate)
- **Current Behavior**: Three-dot menu button with no handler.
- **Problem**: Dead interactive element.
- **Expected Behavior**: Remove dead menu.
- **Priority**: LOW
- **Status**: VERIFIED
- **Fix Implemented**: Removed dead three-dot menu; streamlined header with semantic status pill.
- **Verification Status**: VERIFIED (Verified in `safety_donut_verified.png`).

### Issue UI-010
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx` (Fleet Safety Rate)
- **Current Behavior**: "Show Details" button does nothing.
- **Problem**: Dead button with no dialog or view wired.
- **Expected Behavior**: Opens structured modal displaying fleet safety exceptions, harsh braking, and seatbelt telemetry.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Created `SafetyDetailsModal.tsx` and wired `onViewDetails` handler in `App.tsx`.
- **Verification Status**: VERIFIED (Verified in `safety_modal_opened_verified.png`).

### Issue UI-011
- **Page**: Overview / Dashboard Layout
- **Component**: `App.tsx`
- **Current Behavior**: Right sidebar awkwardly squeezes Most Day Active and Safety Rate alongside charts.
- **Problem**: Vertical fragmentation and poor visual balance.
- **Expected Behavior**: Main Analytics Dashboard spans full width; Most Day Active & Fleet Safety Rate sit in a parallel 2-column grid beneath it.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Restructured `activeTab === 'overview'` layout with full-width `FleetHealthSection` and parallel 2-column `RightSidebarWidgets`.
- **Verification Status**: VERIFIED (Verified in `dashboard_lower_widgets_verified.png`).

### Issue UI-012
- **Page**: AI Copilot
- **Component**: `CopilotWorkspace.tsx`
- **Current Behavior**: Small, centered chat card with restricted width.
- **Problem**: Inadequate for enterprise RAG conversations, code, and telematics tables.
- **Expected Behavior**: 100% available width and height workspace.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Converted `CopilotWorkspace.tsx` into full-height, full-width flex container (`h-[calc(100vh-140px)]`).
- **Verification Status**: VERIFIED (Verified in `ai_copilot_workspace_verified.png`).

### Issue UI-013
- **Page**: AI Copilot
- **Component**: `CopilotWorkspace.tsx`
- **Current Behavior**: Lengthy marketing text explaining telematics correlation and RAG.
- **Problem**: Visual noise that distracts operators from operational workflows.
- **Expected Behavior**: Minimalist header ("VEHYRON Copilot") and clean, direct conversational space.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Replaced marketing copy with concise 1-line subtitle.
- **Verification Status**: VERIFIED (Verified in `ai_copilot_workspace_verified.png`).

### Issue UI-014
- **Page**: AI Copilot
- **Component**: `CopilotWorkspace.tsx`
- **Current Behavior**: False "Zero-Hallucination Guardrails" claims and prominent technical badges.
- **Problem**: Unrealistic claim and excessive technical clutter.
- **Expected Behavior**: Subtle `● Grounded` status indicator; contextual citations.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Replaced "Zero-Hallucination Guardrails" with honest `● Grounded` status; moved RAG details to expandable response citations.
- **Verification Status**: VERIFIED (Verified in `ai_copilot_workspace_verified.png`).

### Issue UI-015
- **Page**: AI Copilot
- **Component**: `CopilotWorkspace.tsx`
- **Current Behavior**: Fixed conversation history pane with no collapse button.
- **Problem**: Wastes chat space when viewing large telematics tables or long responses.
- **Expected Behavior**: Collapsible history sidebar with smooth toggle.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Built collapsible history sidebar with toggle button in workspace header. Chat area expands horizontally to 100% when closed.
- **Verification Status**: VERIFIED (Verified in `ai_copilot_history_collapsed_verified.png`).

### Issue UI-016
- **Page**: Live Operations
- **Component**: `LiveOperationsPanel.tsx`
- **Current Behavior**: Search only checked vehicle ID; did not match fault codes or event types.
- **Problem**: Operator cannot filter by DTCs or telemetry signals.
- **Expected Behavior**: Search matches vehicle ID, VIN, OEM, fault code, event type, and severity.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Re-engineered filter logic to perform multi-field case-insensitive search across vehicle ID, fault code, OEM source, event type, and severity.
- **Verification Status**: VERIFIED (Verified in `live_operations_filtered_verified.png`).

### Issue UI-017
- **Page**: Live Operations
- **Component**: `useSSE.ts` / `LiveOperationsPanel.tsx`
- **Current Behavior**: Clicking refresh wiped state and displayed "Waiting for incoming vehicle events from simulator...".
- **Problem**: Misleading simulator-only messaging in production UI; wiped existing data.
- **Expected Behavior**: Hydrate latest 50 events from database on mount/refresh; seamless SSE merge without data loss.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Built `fetchHistoricalEvents()` in `useSSE.ts` fetching initial 50 events from `/api/v1/dashboard/events`. Replaced simulator empty text with clean operational state.
- **Verification Status**: VERIFIED (Verified in `live_operations_batch1_verified.png`).

### Issue UI-018
- **Page**: Vehicles
- **Component**: `VehicleTable.tsx`
- **Current Behavior**: Search for existing vehicles displayed "No vehicles match the selected criteria".
- **Problem**: Strict casing and incomplete field matching failed queries like "RAV4" or "Toyota".
- **Expected Behavior**: Search accurately matches Vehicle ID, VIN, Make, Model, and Registration Number.
- **Priority**: CRITICAL
- **Status**: VERIFIED
- **Fix Implemented**: Comprehensive multi-field regex and case-insensitive normalization across `id`, `vin`, `make`, `model`, and `registrationNumber`.
- **Verification Status**: VERIFIED (Verified in `vehicles_search_rav4_verified.png`).

### Issue UI-019
- **Page**: Vehicles
- **Component**: `VehicleTable.tsx`
- **Current Behavior**: Hardcoded OEM dropdown limited to 4 makes.
- **Problem**: Does not adapt to connected OEM catalog.
- **Expected Behavior**: Dynamic makes filter derived directly from fleet dataset.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Extracted dynamic unique makes list from fleet assets and rendered data-driven catalog dropdown.
- **Verification Status**: VERIFIED (Verified in `vehicles_registry_verified.png`).

### Issue UI-020
- **Page**: Global
- **Component**: Application-wide
- **Current Behavior**: Dead buttons and non-functional action menus.
- **Problem**: Frustrates users and exposes unfinished prototype state.
- **Expected Behavior**: Every visible control must be fully wired or removed.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Removed all dead 3-dot menus, wired all export buttons, connected modals for safety details, legal documents, and simulator.
- **Verification Status**: VERIFIED across all pages.

### Issue UI-021
- **Page**: AI Copilot
- **Component**: `CopilotWorkspace.tsx`
- **Current Behavior**: Scattered UI cards with cluttered layout.
- **Problem**: Unfocused user experience.
- **Expected Behavior**: Minimalist, ChatGPT-style interface prioritizing conversation.
- **Priority**: HIGH
- **Status**: VERIFIED
- **Fix Implemented**: Full ChatGPT workspace structure: left history sidebar, central message stream, bottom prompt bar, compact clickable prompt chips.
- **Verification Status**: VERIFIED (Verified in `ai_copilot_response_verified.png`).

### Issue UI-022
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx`
- **Current Behavior**: Static SVG values.
- **Problem**: Gauge does not adapt to fleet health data.
- **Expected Behavior**: Gauge computed dynamically from `safetyScore` prop.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Dynamic SVG stroke calculation based on `safetyScore` (default 88%).
- **Verification Status**: VERIFIED (Verified in `safety_donut_verified.png`).

### Issue UI-023
- **Page**: Overview / Widgets
- **Component**: `RightSidebarWidgets.tsx`
- **Current Behavior**: 3-dot menus with empty dropdowns.
- **Problem**: Dead UI element.
- **Expected Behavior**: Remove dead menus.
- **Priority**: LOW
- **Status**: VERIFIED
- **Fix Implemented**: Removed empty menus from both widgets.
- **Verification Status**: VERIFIED.

### Issue UI-024
- **Page**: Live Operations
- **Component**: `LiveOperationsPanel.tsx`
- **Current Behavior**: Long technical paragraphs explaining SSE and JSON schemas.
- **Problem**: Excessive clutter in operational command view.
- **Expected Behavior**: Clean header with "Live Operations Telemetry" and compact status.
- **Priority**: LOW
- **Status**: VERIFIED
- **Fix Implemented**: Reduced header to clean, single-line title with `● Connected` indicator.
- **Verification Status**: VERIFIED (Verified in `live_operations_batch1_verified.png`).

### Issue UI-025
- **Page**: Intelligence Hub
- **Component**: `IntelligenceHub.tsx`
- **Current Behavior**: All tabs functional; need to verify real data and deterministic fallback transparency.
- **Problem**: Unverified capability claims.
- **Expected Behavior**: Clear, honest labeling of deterministic fallback rules when AI services are unconfigured.
- **Priority**: MEDIUM
- **Status**: VERIFIED
- **Fix Implemented**: Explicit fallback indicators and clear VEHYRON Decision Authority Model explanation without fabricated AI claims.
- **Verification Status**: VERIFIED (Verified in `intelligence_hub_verified.png`).
