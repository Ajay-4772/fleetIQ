# FLEETIQ — PROJECT RULES & DIRECTIVES

## 1. Project Identity & Licensing
- FleetIQ is an independent, license-safe fleet intelligence platform inspired by modern connected-vehicle architecture.
- ZERO PROPRIETARY DATA: Never use proprietary Motorq data, internal APIs, credentials, or private information.
- ZERO REAL CUSTOMER/VIN DATA: All vehicle IDs, VINs, registrations, and telemetry are strictly synthetic or derived from verified public sources.
- No fabricated data claims: Label simulated data as "Simulated multi-OEM telemetry inspired by common connected-vehicle signal patterns."

## 2. Architecture & Source of Truth
- Backend is the absolute source of truth.
- Business logic (normalization, priority calculations, severity, issue detection, impact estimation, AI decisioning) resides strictly in the backend.
- Frontend (React + TypeScript) is a consumer of FleetIQ intelligence via REST APIs and Server-Sent Events (SSE).
- Frontend must never invent business calculations or display mock numbers that contradict PostgreSQL.

## 3. Real-Time Event Architecture
- Real-time updates use Server-Sent Events (SSE) via `GET /api/v1/stream/events`.
- Events emitted: `CONNECTED`, `VEHICLE_EVENT`, `CRITICAL_ALERT`, `ACTION_CREATED`, `ACTION_UPDATED`, `HEARTBEAT`.
- Frontend connects with reconnect/backoff handling; REST APIs remain the fallback for full state hydration.
- The UI must never display "Real-Time" when the connection is disconnected.

## 4. Security & Role-Based Access Control (RBAC)
- All mutation endpoints are strictly guarded by Spring Security:
  - Action mutations require `ROLE_OPERATOR`, `ROLE_OPERATIONS_LEAD`, or `ROLE_ADMIN`.
  - Ingestion requires `ROLE_INGESTION` (via `X-API-Key: fleetiq-ingest-secure-key-2026`) or authorized lead/admin role.
  - Viewers (`ROLE_VIEWER`) are strictly read-only and return HTTP 403 on mutation attempts.
- Passwords must be hashed using BCrypt.
- Secrets must never be committed to source code.

## 5. Grounded AI Assistant & RAG Policy
- Cardinal Rule: Never use RAG or vector search as the source of truth for live fleet counts, active faults, or vehicle states.
- Live Operational Queries must be routed to PostgreSQL JPA repositories.
- RAG is strictly reserved for technical knowledge (SAE DTC definitions, OEM schemas, thresholds, system architecture).
- Natural language queries must be mapped to parameterized Java queries; AI must never generate arbitrary SQL.
- If external AI is unavailable, return deterministic factual answers with zero downtime.

## 6. Real Data Export & Multi-Entity Search
- Export must retrieve actual backend data in CSV or JSON format (`/api/v1/export/...`). `window.print()` must never be used as the primary export mechanism.
- Global search must support vehicles, actions, events, and diagnostic trouble codes across backend databases.
