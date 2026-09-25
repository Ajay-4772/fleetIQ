# FleetIQ — Role-Based Access Control (RBAC) Specification

**Document Version:** 1.0.0-PROD  
**Specification:** Authorization Boundaries, Roles, and Permission Matrix

---

## 1. Architectural Philosophy

Role-Based Access Control in FleetIQ follows the principle of least privilege. All authorization checks are enforced server-side via Spring Security annotations (`@PreAuthorize("hasRole('ADMIN')")`). Client-side UI controls (such as hiding tabs or buttons) exist solely for user experience and are never treated as security boundaries.

---

## 2. Defined System Roles

1. **`ROLE_ADMIN` (Fleet Platform Administrator):**
   - Full governance of the platform.
   - User creation, deactivation, and role assignments.
   - Inspection of security audit logs.
   - Database migration management and system configuration.
2. **`ROLE_OPERATOR` (Fleet Operations Dispatcher):**
   - Real-time telematics inspection across all OEM fleets.
   - Action review, priority escalation, and status resolution (`RESOLVED`, `DISMISSED`).
   - Querying AI Copilot for operational diagnostics.
3. **`ROLE_ANALYST` (Fleet Performance Analyst):**
   - Read-only visibility into fleet health metrics, financial impact calculations, and data quality.
   - Querying AI Copilot for maintenance trends and historical patterns.
   - Exporting reports to CSV/JSON.
4. **`ROLE_VIEWER` (Auditor / Executive Viewer):**
   - Read-only dashboard overview access.
   - Cannot mutate action statuses or execute telematics simulations.

---

## 3. API Endpoint Authorization Matrix

| Endpoint Route | HTTP Method | Required Role | Functionality |
| :--- | :---: | :--- | :--- |
| `/api/v1/admin/users/**` | ALL | `ROLE_ADMIN` | User CRUD, account enable/disable, role modification, audit inspection |
| `/api/v1/actions/{id}/status` | PATCH | `ROLE_OPERATOR`, `ROLE_ADMIN` | Transitioning priority work order status with operator notes |
| `/api/v1/assistant/conversations/**`| ALL | Authenticated (`ANY`) | Isolated AI Copilot conversation history and message stream |
| `/api/v1/vehicles/**` | GET | Authenticated (`ANY`) | Monitored asset registry inspection and telematics scores |
| `/api/v1/dashboard/**` | GET | Authenticated (`ANY`) | Live operational health, decision metrics, and system statistics |
| `/api/v1/telemetry/ingest` | POST | Authenticated / Ingest Key | Multi-OEM telemetry ingestion pipeline |
