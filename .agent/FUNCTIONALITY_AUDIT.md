# VEHYRON — Application Functionality & Data Integrity Audit

**Audit Date**: September 25, 2026  
**Auditor**: Principal Software Architect + QA Engineer  
**Classification Standards**: `REAL`, `PARTIALLY REAL`, `MOCKED`, `HARDCODED`, `SIMULATED`, `NOT IMPLEMENTED`, `BROKEN`, `UNKNOWN`  
**Status**: COMPLETE

---

## 1. Feature Classification Matrix

| Feature / Domain | Classification | Underlying Implementation & Data Source | Deficiencies & Findings |
|---|---|---|---|
| **Multi-OEM Telematics Ingestion** | **REAL** | Ingests via `/api/v1/events/ingest`. Adapters for Toyota, Ford, BMW, and Tesla normalize payloads to `CanonicalVehicleEvent`. | Real canonical normalization and validation; handles high-voltage battery and DTC codes. |
| **Deterministic Decision Engine** | **REAL** | `RuleBasedDecisionEngine` executes pre-compiled business directives, estimates downtime costs in INR, and outputs `ActionItem`. | Authoritative, concurrency-safe, deterministic. |
| **Database Persistence & Migrations** | **REAL** | Flyway `V1__initial_schema.sql` & `V2__user_audit_and_copilot_chat.sql`. JPA entities for `Vehicle`, `CanonicalVehicleEvent`, `ActionItem`, `User`, `UserAuditLog`, `ChatConversation`, `ChatMessage`. | Zero Hibernate `ddl-auto: update`. Schema is strictly version-controlled. |
| **Seed Fleet Dataset (60 Vehicles)** | **SIMULATED** | Seeded from `seed-vehicles.json` into the database via `DataInitializer.java` on first startup. | 60 realistic vehicles across 4 OEMs with odometers, battery SoH, and DTC codes. Must not be falsely claimed as hardware IoT feeds. |
| **Real-Time Telemetry Stream (SSE)** | **REAL** | `SseEmitterService` pushes JSON events to connected clients via `/api/v1/stream/events`. | Works, but frontend failed to hydrate historical events on load/refresh, causing empty states. |
| **Live Operations Stream Search** | **BROKEN** | Frontend `LiveOperationsPanel.tsx` only filtered `e.vehicleId`. | Searching for fault codes (e.g. `BATTERY_WARNING`) or OEM names failed completely. |
| **Vehicle Asset Registry Table** | **PARTIALLY REAL** | Backed by `GET /api/v1/vehicles`. | Search failed on make and model; "All Makes" dropdown was hardcoded to 4 options rather than data-driven. |
| **Vehicle Profile Modal** | **REAL** | Backed by `GET /api/v1/vehicles/{id}` and telemetry history query. Displays battery degradation curve and active directives. | Fully functional; close button, telemetry graph, and DTC chips work. |
| **Priority Operational Action Center** | **REAL** | Backed by `GET /api/v1/actions` and `PATCH /api/v1/actions/{id}/status`. Server-enforced RBAC blocks Viewers. | Functional mutations; human review queue and CSV export work. |
| **AI Copilot Workspace** | **REAL** | Full-page workspace backed by `CopilotChatService`, `ChatConversationRepository`, and `ChatMessageRepository`. | Persistent conversation history and user isolation work. Visual layout was too small and contained marketing text. |
| **AI Decisioning & RAG Retrieval** | **PARTIALLY REAL** | In-memory RAG grounding over VEHYRON architecture, maintenance glossary, and vehicle database. Cloud JEV inference is abstracted. | When cloud credentials are absent, system safely executes deterministic fallback. UI must not claim "zero hallucination". |
| **User Directory (Admin)** | **REAL** | Backed by `/api/v1/admin/users/**` and `UserRepository`. Create user, role change, and status toggle work. | Works, but JWT filter was not querying active database status per request. |
| **Security Audit Trail** | **REAL** | Backed by `user_audit_logs` table. Records user creation, deactivation, and role changes. | Needs authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`). |
| **Scenario Simulator** | **SIMULATED** | `SimulatorService.runScenario()` generates synthetic bursts and fault injections. | Legitimate developer/testing tool, but was incorrectly exposed in primary user navigation. |
| **Fleet Safety Rate Widget** | **BROKEN** | In `RightSidebarWidgets.tsx`, radial arc SVG was truncated by `h-24 overflow-hidden`; 3-dot menu and "Show details" had no handlers. | Must fix SVG container, bind real safety rate, and wire "Show details" to a Safety Details modal. |
| **Most Day Active Widget** | **PARTIALLY REAL** | Renders weekly distance bar chart, but 3-dot menu was dead. | Remove dead menu or provide functional period toggle. |
| **Critical Alerts Banner** | **REAL / VIBE-CODED** | Filters actions for `priority === 'CRITICAL' && status === 'OPEN'`. | Functionally real, but visually rendered as an oversized emergency-pink container. |
| **Public Status Pages** | **REAL** | Reusable `SystemStatusPages.tsx` (404, 403, 500, 503) with Correlation IDs and home navigation. | Fully functional. |
| **Legal Compliance Modals** | **REAL TEMPLATE** | Terms of Service, Privacy Policy, Security Policy, Cookies Policy with "LEGAL REVIEW REQUIRED" disclaimer. | Real modals, cleanly disclosed. |

---

## 2. Root Cause Analysis of Primary Functional Defects

1. **Live Stream Empty State on Reload (`UI-017`)**:
   - *Root Cause*: `useSSE.ts` stored events in an ephemeral React state array that initialized to `[]`. It never called `GET /api/v1/dashboard/events` to populate recent telemetry upon component mount or refresh.
   - *Fix*: Hydrate stream state with the last 50 events from `GET /api/v1/dashboard/events`, then prepend new incoming SSE events dynamically.

2. **Vehicle Registry Search Failures (`UI-018`)**:
   - *Root Cause*: `VehicleTable.tsx` filter checked only `v.id`, `v.vin`, and `v.model`. It omitted `v.make` and failed on undefined values.
   - *Fix*: Normalize search query across all vehicle attributes with null safety.

3. **Fleet Safety Gauge Render Failure (`UI-008`, `UI-010`)**:
   - *Root Cause*: Outer `div` was styled with `w-44 h-24 overflow-hidden` while the SVG circle was `w-44 h-44`. The top arc was entirely masked out. Furthermore, `onViewDetails` prop was not connected in `App.tsx`.
   - *Fix*: Fix SVG viewBox and dimensions, render responsive gauge, and wire `onViewDetails` to a real Safety Metrics Modal.
