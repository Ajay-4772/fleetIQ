# VEHYRON — UI/UX Requirement Traceability Matrix

**Batch**: 1  
**Status**: ACTIVE  

---

| Requirement ID | Description | Source / Section | Component / File | Current State | Planned Fix | Status |
|---|---|---|---|---|---|---|
| **REQ-UI-01** | Simplify critical operations alerts (no full red/pink card) | Prompt Sec 3 | `CriticalAlertsBanner.tsx` | Full rose background `bg-rose-50/60` | White card, red badge, minimal accent | PLANNED |
| **REQ-UI-02** | Remove Simulator from primary top navigation | Prompt Sec 4 | `Header.tsx` | Simulator button in header | Remove from header; keep in secondary sidebar | PLANNED |
| **REQ-UI-03** | Remove "Ask AI" from top navigation | Prompt Sec 5 | `Header.tsx` | Duplicate Ask AI in header | Remove duplicate header button | PLANNED |
| **REQ-UI-04** | Remove SVG / icon text artifacts | Prompt Sec 6 | All icon/SVG tags | Text leakage in accessibility tree | Shield all icons with `aria-hidden="true"` | PLANNED |
| **REQ-UI-05** | Simplify Real-Time Stream indicator | Prompt Sec 7 | `Header.tsx` | Large animated pill | Subtle `● Live` status indicator | PLANNED |
| **REQ-UI-06** | Collapsible left sidebar | Prompt Sec 8 | `Sidebar.tsx` | Fixed `w-60` width | Collapse/expand toggle (`w-60` <-> `w-16`) | PLANNED |
| **REQ-UI-07** | Remove/fix Most Day Active 3-dot menu | Prompt Sec 9 | `RightSidebarWidgets.tsx` | Dead 3-dot button | Remove dead button | PLANNED |
| **REQ-UI-08** | Fix Fleet Safety Rate donut/gauge | Prompt Sec 10 | `RightSidebarWidgets.tsx` | Cut off by `overflow-hidden h-24` | Responsive SVG donut gauge with real score | PLANNED |
| **REQ-UI-09** | Wire up Fleet Safety Rate "Show Details" | Prompt Sec 10 | `SafetyDetailsModal.tsx` | Dead button | Open real Safety Details modal | PLANNED |
| **REQ-UI-10** | Restructure lower dashboard widgets layout | Prompt Sec 11 | `App.tsx` | Widgets in 1/3 column beside chart | Full-width chart, parallel 2-col lower grid | PLANNED |
| **REQ-UI-11** | Full-bleed ChatGPT-style AI Copilot | Prompt Sec 12, 13, 16 | `CopilotWorkspace.tsx` | Constrained width & height | 100% available width and height | PLANNED |
| **REQ-UI-12** | Remove AI excessive marketing text | Prompt Sec 14 | `CopilotWorkspace.tsx` | Long introductory subtitle | Strip marketing text | PLANNED |
| **REQ-UI-13** | Replace "Zero-Hallucination" with `● Grounded` | Prompt Sec 14 | `CopilotWorkspace.tsx` | False security claim | Subtle `● Grounded` status indicator | PLANNED |
| **REQ-UI-14** | Minimize AI suggested question chips | Prompt Sec 15 | `CopilotWorkspace.tsx` | 4 giant cards | 3-4 compact clickable suggestion chips | PLANNED |
| **REQ-UI-15** | Collapsible AI conversation history sidebar | Prompt Sec 17 | `CopilotWorkspace.tsx` | Fixed left panel | Collapse/expand sidebar toggle | PLANNED |
| **REQ-UI-16** | Clean contextual AI citations | Prompt Sec 18, 19 | `CopilotWorkspace.tsx` | Verbose fixed headers | Expandable source list inside messages | PLANNED |
| **REQ-UI-17** | Simplify Live Operations header | Prompt Sec 20 | `LiveOperationsPanel.tsx` | Large paragraphs explaining SSE | Minimal header + `● Connected` indicator | PLANNED |
| **REQ-UI-18** | Fix Live Operations multi-field search | Prompt Sec 21 | `LiveOperationsPanel.tsx` | Only checks vehicleId | Search across ID, fault code, OEM, severity | PLANNED |
| **REQ-UI-19** | Hydrate Live Operations from database | Prompt Sec 22 | `useSSE.ts`, `LiveOperationsPanel.tsx` | Wiped on reload / refresh | Pre-hydrate from `/api/v1/dashboard/events` | PLANNED |
| **REQ-UI-20** | Fix Vehicle Registry search | Prompt Sec 23 | `VehicleTable.tsx` | Fails on make/model | Multi-field search with null-safety | PLANNED |
| **REQ-UI-21** | Data-driven OEM vehicle catalog | Prompt Sec 24 | `VehicleTable.tsx` | Hardcoded 4 options | Dynamically derived from vehicle dataset | PLANNED |
| **REQ-UI-22** | Remove TLS 1.3 / JWT RBAC from login | Prompt Sec 2 | `LoginPage.tsx` | Internal security jargon | Remove label; clean enterprise login | PLANNED |
| **REQ-UI-23** | Eliminate AI duplicate card & 3D sphere | Prompt Sec 14 | `RightSidebarWidgets.tsx` | 3rd card with sphere placeholder | Completely delete card 3 | PLANNED |
