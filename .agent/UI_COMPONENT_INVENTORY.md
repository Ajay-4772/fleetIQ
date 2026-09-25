# FleetIQ — UI Component Inventory & Reusability Catalog

**Version**: 2.0.0  
**Status**: AUDITED  

---

## 1. Global & Layout Primitives

| Component | Path | Responsibility | Dependencies | State & Handlers |
|---|---|---|---|---|
| `Header` | `frontend/src/components/layout/Header.tsx` | Top application header, global search, real-time live indicator, notifications flyout, user profile menu | `useAuth`, `Search`, `Bell`, `ChevronDown` | `searchQuery`, `showNotifications`, `showUserMenu` |
| `Sidebar` | `frontend/src/components/layout/Sidebar.tsx` | Main navigation sidebar with role-aware tabs, collapse toggle, badge counters | `useAuth`, `NavTab` | `isCollapsed`, `activeTab`, `onSelectTab` |
| `LegalModal` | `frontend/src/components/system/LegalModal.tsx` | Reusable modal dialog for Terms of Service, Privacy Policy, Security Policy, Cookies Policy | `Shield`, `FileText`, `X` | `type`, `onClose` |
| `SystemStatusPages` | `frontend/src/components/system/SystemStatusPages.tsx` | Reusable status views (NotFound 404, AccessDenied 403, ServerError 500, Maintenance 503) | `AlertTriangle`, `ShieldAlert`, `ServerCrash`, `Wrench` | `onReturnHome`, `onRetry`, `requestId` |

---

## 2. Operations & Dashboard Components

| Component | Path | Responsibility | Reusability |
|---|---|---|---|
| `FleetOverviewCards` | `frontend/src/components/overview/FleetOverviewCards.tsx` | 4 top KPI cards (Total Fleet, Active, Critical Actions, Estimated Risk in INR) | Overview page |
| `CriticalAlertsBanner` | `frontend/src/components/live/CriticalAlertsBanner.tsx` | Critical alerts banner with white card styling, red severity badge, and inspect triggers | Overview page & Notifications |
| `FleetHealthSection` | `frontend/src/components/overview/FleetHealthSection.tsx` | Fleet health scrubbed curve and operating duty cycle meters | Full-width analytics dashboard |
| `RightSidebarWidgets` | `frontend/src/components/overview/RightSidebarWidgets.tsx` | Most Day Active bar chart & Fleet Safety Rate circular donut gauge | Parallel 2-column lower grid |
| `SafetyDetailsModal` | `frontend/src/components/overview/SafetyDetailsModal.tsx` | Detailed safety breakdown (harsh braking, seatbelt, speeding, safety score distribution) | Triggered by "Show details" |
| `LiveOperationsPanel` | `frontend/src/components/live/LiveOperationsPanel.tsx` | Real-time multi-OEM event stream table, multi-field search, severity & OEM filters | Live Operations tab |

---

## 3. Fleet Assets & Action Center

| Component | Path | Responsibility | Reusability |
|---|---|---|---|
| `VehicleTable` | `frontend/src/components/vehicles/VehicleTable.tsx` | Fleet asset registry table, dynamic OEM filter, status filter, multi-field search, pagination | Vehicles tab |
| `VehicleProfileModal` | `frontend/src/components/vehicles/VehicleProfileModal.tsx` | Deep-dive modal for vehicle telematics, battery SoH degradation, active DTCs, odometer | Triggered anywhere vehicle ID is clicked |
| `PriorityActionCenter` | `frontend/src/components/actions/PriorityActionCenter.tsx` | Priority decision engine work orders, human review queue, status update modal trigger | Actions tab |

---

## 4. Intelligence & AI Workspace

| Component | Path | Responsibility | Reusability |
|---|---|---|---|
| `CopilotWorkspace` | `frontend/src/components/copilot/CopilotWorkspace.tsx` | Full-page conversational AI workspace, collapsible session history, compact suggestion chips, grounded citations | Copilot tab |
| `IntelligenceHub` | `frontend/src/components/intelligence/IntelligenceHub.tsx` | Decision metrics, rule authority model, human review queue, fault distribution, financial risk | Intelligence Hub tab |

---

## 5. Security & Administration

| Component | Path | Responsibility | Reusability |
|---|---|---|---|
| `LoginPage` | `frontend/src/components/auth/LoginPage.tsx` | Production portal login with credential validation, error feedback, legal links | Unauthenticated root |
| `UserManagementPanel` | `frontend/src/components/admin/UserManagementPanel.tsx` | Admin user directory, create user modal, role mutation, status toggle, security audit log | Admin-only Users tab |
| `SimulatorModal` | `frontend/src/components/simulator/SimulatorModal.tsx` | Telematics scenario injection, synthetic OEM telemetry generation | Secondary testing tools |
| `SystemHealthPanel` | `frontend/src/components/system/SystemHealthPanel.tsx` | Database connectivity, SSE stream health, schema pass rates, latency metrics | System Health tab |
