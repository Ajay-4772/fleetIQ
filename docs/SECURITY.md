# VEHYRON — Security, Authentication & RBAC Specification

## 1. Security Architecture Overview
VEHYRON applies defense-in-depth principles across all API layers:
- **Stateless JWT Authentication** for human operators, fleet leads, and administrators.
- **Service-to-Service API Key Authentication** for external telemetry pipelines and OEM cloud gateways.
- **Role-Based Access Control (RBAC)** enforced strictly at the Spring Security filter and controller levels.
- **CORS, Secure Headers & BCrypt Password Encryption**.

---

## 2. Default Seeded User Roles

Four default accounts are seeded by `DataInitializer.java` on application bootstrap:

| Username | Password | Role | Permissions |
|---|---|---|---|
| `admin` | `Admin@VEHYRON2026` | `ROLE_ADMIN` | Full access: User administration, system settings, data quality overrides, simulator controls, action mutations. |
| `ops_lead` | `Ops@VEHYRON2026` | `ROLE_OPERATIONS_LEAD` | Operations management: Scenario simulator control, action assignment, operator oversight, export. |
| `operator` | `Operator@VEHYRON2026` | `ROLE_OPERATOR` | Triage & dispatch: View fleet telemetry, update action lifecycle status (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `DISMISSED`), add technician notes. |
| `viewer` | `Viewer@VEHYRON2026` | `ROLE_VIEWER` | Read-only access: View overview dashboard, search vehicles, inspect actions, query AI assistant. Mutation requests return **403 Forbidden**. |

---

## 3. Role-Based Access Control Matrix

| Endpoint | Method | Permitted Roles | Notes |
|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Public | Issues signed JWT token (24-hour expiration) |
| `/api/v1/auth/me` | `GET` | Authenticated | Returns current user profile and role |
| `/api/v1/events/ingest` | `POST` | `ROLE_INGESTION`, `ROLE_OPERATIONS_LEAD`, `ROLE_ADMIN` | External telemetry ingestion (X-API-Key or JWT) |
| `/api/v1/actions/{id}/status` | `PATCH`, `PUT` | `ROLE_OPERATOR`, `ROLE_OPERATIONS_LEAD`, `ROLE_ADMIN` | Action lifecycle mutations (**VIEWER gets 403**) |
| `/api/v1/simulator/**` | Any | `ROLE_OPERATIONS_LEAD`, `ROLE_ADMIN` | Scenario execution and benchmark stress testing |
| `/api/v1/system/**` | Any | `ROLE_ADMIN` | System resets and administrative metrics |
| `/api/v1/dashboard/**` | `GET` | All Authenticated | Summary, health, trends, data quality |
| `/api/v1/vehicles/**` | `GET` | All Authenticated | Asset registry, telemetry profiles |
| `/api/v1/export/**` | `GET` | All Authenticated | Real CSV and JSON data export |
| `/api/v1/assistant/**` | `POST` | All Authenticated | Grounded AI assistant querying |

---

## 4. Service-to-Service Ingestion Security

External telemetry pipelines authenticate using the HTTP header:
```http
X-API-Key: fleetiq-ingest-secure-key-2026
```
- Configured via environment variable: `FLEETIQ_INGESTION_API_KEY`.
- If an invalid key or missing credentials are submitted, the backend rejects the request with **403 Forbidden**.
- Prevents unauthenticated external systems from injecting malicious or spurious telemetry events.

---

## 5. Security Hardening Measures
1. **Never Commit Secrets**: All API keys, database credentials, and JWT signing keys are loaded from environment variables or secure application profiles.
2. **Payload Size & Rate Limits**: Telemetry payloads are strictly validated before normalization.
3. **No Arbitrary SQL from AI**: Natural language questions are parsed into deterministic parameterized JPA queries. The AI never generates or executes raw SQL queries.
4. **BCrypt Password Hashing**: Passwords are encrypted using Spring Security's `BCryptPasswordEncoder` with strength factor 10.
