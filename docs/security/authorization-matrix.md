# VEHYRON — Endpoint Authorization & RBAC Matrix

**Classification:** Enterprise Security Specification  
**Architecture:** Zero-Trust Dual-Role RBAC Model  
**Roles:** `ROLE_ADMIN`, `ROLE_OPERATOR`  
**Enforcement Layer:** Spring Security 6 Method Security (`@PreAuthorize`) & SecurityFilterChain  

---

## 1. Role Definitions & Access Principles

1. **`ROLE_ADMIN`**: Full platform authority. Governs user lifecycle, security audit logs, data source connectors, batch file uploads, dead-letter queue replay, and system status health.
2. **`ROLE_OPERATOR`**: Operational telematics visibility. Inspects fleet assets, live telematics, diagnostics, action prioritizations, and conversational assistant. Forbidden from administrative configuration or governance endpoints.
3. **`ANONYMOUS`**: Unauthenticated public visitors. Strictly restricted to public authentication flows, health probes, and secured webhook endpoints.

---

## 2. Master Endpoint Authorization Matrix

| Endpoint | HTTP Method | Auth Required | ADMIN | OPERATOR | Underlying Permission / Constraint |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication & Lifecycle** | | | | | |
| `/api/v1/auth/login` | POST | No | Allowed | Allowed | Public login; rate-limited (15 req/min) |
| `/api/v1/auth/register` | POST | No | Allowed | Allowed | Public registration; strictly defaults to OPERATOR |
| `/api/v1/auth/refresh` | POST | No | Allowed | Allowed | Rotates valid refresh token; revokes old token |
| `/api/v1/auth/forgot-password`| POST | No | Allowed | Allowed | Generates single-use token; anti-enumeration |
| `/api/v1/auth/reset-password` | POST | No | Allowed | Allowed | Consumes single-use token; revokes active sessions |
| `/api/v1/auth/logout` | POST | Yes | Allowed | Allowed | Revokes active refresh token |
| `/api/v1/auth/me` | GET | Yes | Allowed | Allowed | Returns authenticated caller's identity profile |
| **Fleet Asset Management** | | | | | |
| `/api/v1/vehicles` | GET | Yes | Allowed | Allowed | `FLEET_READ`; bounded pagination |
| `/api/v1/vehicles/{id}` | GET | Yes | Allowed | Allowed | `VEHICLE_READ`; returns vehicle telemetry snapshot |
| `/api/v1/vehicles/{id}/profile`| GET | Yes | Allowed | Allowed | `VEHICLE_READ`; returns comprehensive telemetry profile |
| **Live Telemetry & Dashboard** | | | | | |
| `/api/v1/dashboard/summary` | GET | Yes | Allowed | Allowed | `DASHBOARD_READ`; fleet aggregations |
| `/api/v1/dashboard/health` | GET | Yes | Allowed | Allowed | `DASHBOARD_READ`; calculated fleet health index |
| `/api/v1/dashboard/stream` | GET | No / Token | Allowed | Allowed | SSE real-time telemetry stream |
| `/api/v1/telemetry/stream` | GET | No / Token | Allowed | Allowed | SSE real-time telemetry stream |
| `/api/v1/stream/events` | GET | No / Token | Allowed | Allowed | SSE real-time telemetry stream |
| **Operational Action Queue** | | | | | |
| `/api/v1/actions` | GET | Yes | Allowed | Allowed | `ACTION_READ`; paginated action items |
| `/api/v1/actions/{id}` | GET | Yes | Allowed | Allowed | `ACTION_READ`; single action item detail |
| `/api/v1/actions/{id}/status` | PATCH | Yes | Allowed | Allowed | `ACTION_UPDATE`; status transition (OPEN -> IN_PROGRESS) |
| **Intelligence & Assistant** | | | | | |
| `/api/v1/assistant/chat` | POST | Yes | Allowed | Allowed | `AI_QUERY`; RAG copilot grounded query |
| `/api/v1/copilot/chat` | POST | Yes | Allowed | Allowed | `AI_QUERY`; multi-turn copilot session |
| `/api/v1/copilot/conversations`| GET | Yes | Allowed | Allowed | `AI_QUERY`; user's conversation history |
| `/api/fleet/query` | POST | Yes | Allowed | Allowed | `AI_QUERY`; fleet natural-language query |
| **Data Ingestion & Connectors** | | | | | |
| `/api/v1/ingestion/sources` | GET | Yes | Allowed | **DENIED (403)** | `INGESTION_CONFIG`; connector listing |
| `/api/v1/ingestion/sources` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_CONFIG`; connector registration |
| `/api/v1/ingestion/sources/{id}`| GET | Yes | Allowed | **DENIED (403)** | `INGESTION_CONFIG`; connector detail |
| `/api/v1/ingestion/sources/{id}`| PUT | Yes | Allowed | **DENIED (403)** | `INGESTION_CONFIG`; connector modification |
| `/api/v1/ingestion/sources/{id}`| DELETE | Yes | Allowed | **DENIED (403)** | `INGESTION_CONFIG`; connector deletion |
| `/api/v1/ingestion/sources/{id}/test` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_TEST`; broker handshake test |
| `/api/v1/ingestion/sources/{id}/start`| POST | Yes | Allowed | **DENIED (403)** | `INGESTION_START`; start telemetry consumer |
| `/api/v1/ingestion/sources/{id}/stop` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_STOP`; stop telemetry consumer |
| `/api/v1/ingestion/upload/preview` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_UPLOAD`; schema detection & preview |
| `/api/v1/ingestion/upload` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_UPLOAD`; stream dataset ingestion |
| `/api/v1/ingestion/jobs` | GET | Yes | Allowed | **DENIED (403)** | `INGESTION_AUDIT`; job execution history |
| `/api/v1/ingestion/quality` | GET | Yes | Allowed | **DENIED (403)** | `INGESTION_QUALITY`; data hygiene metrics |
| `/api/v1/ingestion/raw-records` | GET | Yes | Allowed | **DENIED (403)** | `INGESTION_INSPECT`; dead-letter payload inspection |
| `/api/v1/ingestion/retry/{id}` | POST | Yes | Allowed | **DENIED (403)** | `INGESTION_REPLAY`; dead-letter event replay |
| `/api/v1/ingestion/webhooks/{sourceId}` | POST | No (Webhook Key) | Allowed | Allowed | Public webhook ingestion with signature/API key |
| `/api/v1/events/ingest` | POST | API Key / Admin | Allowed | **DENIED (403)** | Direct REST telemetry ingestion |
| **User Governance & Admin** | | | | | |
| `/api/v1/admin/users` | GET | Yes | Allowed | **DENIED (403)** | `USER_READ`; user directory table |
| `/api/v1/admin/users/search` | GET | Yes | Allowed | **DENIED (403)** | `USER_READ`; user search |
| `/api/v1/admin/users` | POST | Yes | Allowed | **DENIED (403)** | `USER_CREATE`; provision new user |
| `/api/v1/admin/users/{id}/status` | PATCH | Yes | Allowed | **DENIED (403)** | `USER_UPDATE`; activate / deactivate user |
| `/api/v1/admin/users/{id}/role` | PATCH | Yes | Allowed | **DENIED (403)** | `ROLE_UPDATE`; change role between ADMIN and OPERATOR |
| `/api/v1/admin/users/audit` | GET | Yes | Allowed | **DENIED (403)** | `AUDIT_READ`; security audit trail |
| `/api/v1/admin/system/status` | GET | Yes | Allowed | **DENIED (403)** | `SYSTEM_READ`; live platform health components |
| **System & Simulator** | | | | | |
| `/api/v1/simulator/start` | POST | Yes | Allowed | **DENIED (403)** | `SIMULATOR_MANAGE`; start test load generator |
| `/api/v1/simulator/stop` | POST | Yes | Allowed | **DENIED (403)** | `SIMULATOR_MANAGE`; stop test load generator |
| `/actuator/health` | GET | No | Allowed | Allowed | Kubernetes liveness/readiness probe |
| `/actuator/info` | GET | No | Allowed | Allowed | Application build metadata |
| `/actuator/metrics` | GET | Yes (Admin) | Allowed | **DENIED (403)** | Prometheus / JVM internal metrics |
