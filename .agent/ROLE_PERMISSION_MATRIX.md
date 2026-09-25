# FleetIQ — Fine-Grained Role & Permission Matrix

**Document Version**: 2.0.0  
**Scope**: Explicit mapping between system permissions, business operations, and security roles.  

---

## 1. Domain Permission Definitions

| Permission ID | Description | Primary Affected Endpoints |
|---|---|---|
| `vehicles.read` | View connected vehicle registry and telemetry diagnostics | `GET /api/v1/vehicles/**` |
| `vehicles.export` | Download vehicle asset registry datasets as CSV/JSON | `GET /api/v1/export/vehicles` |
| `actions.read` | View priority operational decisions and work order queue | `GET /api/v1/actions/**` |
| `actions.mutate_status` | Mutate action status (Open -> In Progress -> Resolved) | `PATCH /api/v1/actions/{id}/status` |
| `actions.export` | Download action work orders as CSV/JSON | `GET /api/v1/export/actions` |
| `telemetry.read` | Inspect historical vehicle events and DTC codes | `GET /api/v1/dashboard/events` |
| `telemetry.stream_sse` | Connect to live Server-Sent Events real-time stream | `GET /api/v1/stream/events` |
| `telemetry.simulate` | Execute synthetic multi-OEM scenarios and fault injection | `POST /api/v1/simulator/run` |
| `telemetry.ingest` | Post raw OEM telematics payloads (Toyota, Ford, BMW, Tesla) | `POST /api/v1/events/ingest` |
| `ai.query` | Submit natural language operational queries to AI Copilot | `POST /api/v1/assistant/**` |
| `ai.manage_threads` | Create, list, and delete persistent Copilot conversation threads | `/api/v1/assistant/conversations/**` |
| `users.read` | View administrative user directory and security profiles | `GET /api/v1/admin/users/**` |
| `users.create` | Create new corporate users with initial role assignment | `POST /api/v1/admin/users` |
| `users.update_status` | Deactivate or reactivate platform user accounts | `PATCH /api/v1/admin/users/{id}/status` |
| `users.update_role` | Mutate user security role (e.g. Viewer -> Operator) | `PATCH /api/v1/admin/users/{id}/role` |
| `audit.read` | Inspect immutable security audit log trail | `GET /api/v1/admin/users/audit` |
| `system_health.read` | Inspect database connectivity, latency, and schema pass rates | `GET /api/v1/dashboard/**`, `/actuator/health` |

---

## 2. Role to Permission Mapping Matrix

| Permission | Admin (`ROLE_ADMIN`) | Ops Lead (`ROLE_OPERATIONS_LEAD`) | Operator (`ROLE_OPERATOR`) | Viewer (`ROLE_VIEWER`) | Ingestion (`ROLE_INGESTION`) | Anonymous |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `vehicles.read` | YES | YES | YES | YES | NO | NO |
| `vehicles.export` | YES | YES | YES | YES | NO | NO |
| `actions.read` | YES | YES | YES | YES | NO | NO |
| `actions.mutate_status` | **YES** | **YES** | **YES** | **NO** | NO | NO |
| `actions.export` | YES | YES | YES | YES | NO | NO |
| `telemetry.read` | YES | YES | YES | YES | NO | NO |
| `telemetry.stream_sse` | YES | YES | YES | YES | NO | NO |
| `telemetry.simulate` | **YES** | **YES** | **NO** | **NO** | NO | NO |
| `telemetry.ingest` | **YES** | **YES** | **NO** | **NO** | **YES** | NO |
| `ai.query` | YES | YES | YES | YES | NO | NO |
| `ai.manage_threads` | YES | YES | YES | YES | NO | NO |
| `users.read` | **YES** | **NO** | **NO** | **NO** | NO | NO |
| `users.create` | **YES** | **NO** | **NO** | **NO** | NO | NO |
| `users.update_status` | **YES** | **NO** | **NO** | **NO** | NO | NO |
| `users.update_role` | **YES** | **NO** | **NO** | **NO** | NO | NO |
| `audit.read` | **YES** | **NO** | **NO** | **NO** | NO | NO |
| `system_health.read` | YES | YES | YES | YES | NO | YES (`/health`) |

---

## 3. Enforcement Layers

1. **Frontend**: Navigation tabs and buttons for administrative capabilities (`users.*`, `audit.*`) are completely hidden for non-admin roles (`ROLE_OPERATOR`, `ROLE_VIEWER`).
2. **Filter & Gateway**: Requests with invalid or missing tokens fail with HTTP 401.
3. **SecurityConfig HTTP Authorization**: Requests attempting unauthorized actions (e.g. Viewer attempting `PATCH /api/v1/actions/**`) are rejected with HTTP 403.
4. **Method Security**: Controllers are annotated with `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`.
