# VEHYRON — Role-Based Access Control (RBAC) & Permission Matrix

**Classification:** Enterprise Security Specification  
**Version:** 2.0.0  
**Status:** Canonical & Enforced

---

## 1. Domain Roles

VEHYRON categorizes platform actors into four primary business operational roles, plus one internal automated ingestion principal:

1. **`ROLE_ADMIN` (System & Fleet Governance Administrator)**
   * Complete governance over platform settings, user lifecycle, role assignment, and security audit logs.
   * Unrestricted visibility and mutation rights across all vehicles, actions, simulators, and telemetry.
2. **`ROLE_OPERATIONS_LEAD` (Fleet Operations Lead / Supervisor)**
   * Senior operational authority. Can acknowledge actions, dispatch maintenance, trigger multi-vehicle simulation scenarios, and ingest telemetry data.
   * Cannot manage platform users, assign roles, or modify security configurations.
3. **`ROLE_OPERATOR` (Fleet Operator / Dispatcher)**
   * Day-to-day operations dispatcher. Can inspect vehicles, update action item statuses (`IN_PROGRESS`, `RESOLVED`, `DISMISSED`), add technician notes, and run conversational copilot queries.
   * Prohibited from managing users, running destructive simulation resets, or changing platform settings.
4. **`ROLE_VIEWER` (Fleet Analyst / Executive Stakeholder)**
   * Read-only analytical visibility across fleet overview, vehicles table, live telemetry streaming, and intelligence metrics.
   * Prohibited from mutating any vehicle status, executing actions, triggering simulator runs, or accessing administration consoles.
5. **`ROLE_INGESTION` (Automated Telemetry Gateway Principal)**
   * Headless service-to-service ingestion principal authenticated via `X-API-Key` or service token.
   * Strictly limited to `POST /api/v1/events/ingest`. Cannot read general fleet data or query copilot.

---

## 2. Canonical Permissions

| Permission Key | Description | Granularity |
| :--- | :--- | :--- |
| `USER_READ` | View platform user accounts and metadata | Administration |
| `USER_CREATE` | Provision and invite new users | Administration |
| `USER_STATUS_UPDATE` | Activate or deactivate user accounts | Administration |
| `ROLE_ASSIGN` | Elevate or demote user security roles | Administration |
| `AUDIT_READ` | Inspect immutable security audit log trail | Administration |
| `SYSTEM_HEALTH_READ` | View Spring Boot Actuator & service health metrics | Infrastructure |
| `VEHICLE_READ` | View vehicle profiles, telemetry, DTC fault codes | Fleet Data |
| `VEHICLE_EXPORT` | Export vehicle registry and metrics to CSV/JSON | Data Export |
| `ACTION_READ` | View decision engine priority actions queue | Operations |
| `ACTION_UPDATE` | Change action status (`IN_PROGRESS`, `RESOLVED`, `DISMISSED`) | Operations |
| `ACTION_EXPORT` | Export action items list to CSV | Data Export |
| `TELEMETRY_STREAM_READ`| Connect to live SSE telemetry event stream | Real-time Stream |
| `TELEMETRY_INGEST` | Ingest external OEM telematics payloads | Ingestion |
| `COPILOT_USE` | Converse with VEHYRON Intelligence Copilot & persist chat | AI / Analytics |
| `SIMULATOR_EXECUTE` | Trigger synthetic telematics scenarios or fleet reset | Testing / Dev |

---

## 3. Comprehensive Role-to-Permission Matrix

| Permission | ROLE_ADMIN | ROLE_OPERATIONS_LEAD | ROLE_OPERATOR | ROLE_VIEWER | ROLE_INGESTION |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `USER_READ` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `USER_CREATE` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `USER_STATUS_UPDATE` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `ROLE_ASSIGN` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `AUDIT_READ` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `SYSTEM_HEALTH_READ` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `VEHICLE_READ` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `VEHICLE_EXPORT` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `ACTION_READ` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `ACTION_UPDATE` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ACTION_EXPORT` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `TELEMETRY_STREAM_READ`| ✅ | ✅ | ✅ | ✅ | ❌ |
| `TELEMETRY_INGEST` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `COPILOT_USE` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `SIMULATOR_EXECUTE` | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 4. API Endpoint Access Matrix

| HTTP Method & Path | Minimum Authority Required | Spring Security Enforcement | Prohibited Roles (HTTP 403) |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/vehicles/**` | Authenticated | `anyRequest().authenticated()` | Anonymous (401) |
| `GET /api/v1/actions/**` | Authenticated | `anyRequest().authenticated()` | Anonymous (401) |
| `PATCH /api/v1/actions/**` | `ROLE_OPERATOR` | `hasAnyAuthority('ROLE_OPERATOR', 'ROLE_OPERATIONS_LEAD', 'ROLE_ADMIN')` | `ROLE_VIEWER` (403) |
| `PUT /api/v1/actions/**` | `ROLE_OPERATOR` | `hasAnyAuthority('ROLE_OPERATOR', 'ROLE_OPERATIONS_LEAD', 'ROLE_ADMIN')` | `ROLE_VIEWER` (403) |
| `POST /api/v1/events/ingest`| `ROLE_INGESTION` | `hasAnyAuthority('ROLE_INGESTION', 'ROLE_OPERATIONS_LEAD', 'ROLE_ADMIN')` | `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `POST /api/v1/simulator/**`| `ROLE_OPERATIONS_LEAD` | `hasAnyAuthority('ROLE_OPERATIONS_LEAD', 'ROLE_ADMIN')` | `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `GET /api/v1/admin/users/**` | `ROLE_ADMIN` | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` | `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `POST /api/v1/admin/users/**`| `ROLE_ADMIN` | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` | `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `PATCH /api/v1/admin/users/**`| `ROLE_ADMIN` | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` | `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `GET /api/v1/admin/users/audit`| `ROLE_ADMIN` | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` | `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER` |
| `POST /api/v1/auth/login` | Public | `.permitAll()` | None |
| `POST /api/v1/auth/register` | Public (default `ROLE_VIEWER`) | `.permitAll()` | None |
| `POST /api/v1/auth/forgot-password` | Public | `.permitAll()` | None |
| `POST /api/v1/auth/reset-password` | Public (requires valid token) | `.permitAll()` | None |
| `POST /api/v1/auth/refresh` | Public (requires valid refresh token) | `.permitAll()` | None |
| `POST /api/v1/auth/logout` | Authenticated | `anyRequest().authenticated()` | Anonymous (401) |

---

## 5. UI Permission Reflection Rules

1. **User Directory Tab**: Displayed in the navigation sidebar exclusively for users where `user.role === 'ROLE_ADMIN'`. If a non-admin directly requests the user directory view, the system renders [`AccessDeniedPage.tsx`](file:///c:/Users/ajaya/Desktop/vehyron/frontend/src/components/system/SystemStatusPages.tsx) with HTTP 403 feedback.
2. **Action Item Mutation Buttons**: In [`PriorityActionCenter.tsx`](file:///c:/Users/ajaya/Desktop/vehyron/frontend/src/components/actions/PriorityActionCenter.tsx), action resolution controls ("Acknowledge", "Mark In-Progress", "Resolve") are rendered as interactive buttons only for `ROLE_OPERATOR`, `ROLE_OPERATIONS_LEAD`, and `ROLE_ADMIN`. For `ROLE_VIEWER`, the status is displayed as a read-only tag.
3. **Simulator Controls**: The "Simulator (Dev)" trigger is available in the sidebar only for `ROLE_OPERATIONS_LEAD` and `ROLE_ADMIN`.
