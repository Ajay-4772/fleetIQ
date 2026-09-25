# VEHYRON — Complete Project Name & Ingestion Pipeline Migration Report

**Date**: September 25, 2026  
**Previous Brand**: FleetIQ  
**New Official Brand**: VEHYRON  
**Product Category**: Connected Vehicle Intelligence Platform  
**Primary Description**: Multi-OEM vehicle telemetry, event normalization, operational intelligence, and AI-assisted decision engineering platform.

---

## 1. Executive Summary & Migration Rationale
The project has undergone a complete, repository-wide product identity migration from the legacy internal codename "FleetIQ" to its official enterprise product name: **VEHYRON**. 

Crucially, this was **not** a cosmetic text replacement. In accordance with platform governance rules:
1. **Domain Terminology Preserved**: Legitimate automotive domain concepts such as `fleet`, `vehicle`, `fleet_id`, `fleet management`, and `/api/fleet/**` were rigorously preserved and distinguished from the product brand.
2. **Real Enterprise Data Ingestion Gateway**: All static, demo, and hardcoded vehicle records were eliminated. The platform now operates on an authentic data pipeline: External Sources -> Gateway Connectors -> Raw Storage -> Schema Validation -> Multi-OEM Normalization -> Intelligence Engine -> Module Routing -> Persistence -> SSE Stream -> Operations UI.
3. **Strict 2-Role RBAC**: The role model was consolidated into strictly two application roles: `ROLE_ADMIN` and `ROLE_OPERATOR`. Public registrations default to `ROLE_OPERATOR`. The login role dropdown verifies against the database role; mismatches are safely rejected.
4. **Zero-Demo Database Baseline**: An empty database (0 vehicles) is now a fully valid, supported state with informative empty states and dynamic metrics calculation.

---

## 2. Repository Brand vs. Domain Audit

| Category | Legacy Term | Migrated / Preserved Representation | Rationale |
|---|---|---|---|
| **Product Brand** | FleetIQ | **VEHYRON** | Official product name across UI, titles, headers, footers, copy |
| **Product Subtitle** | Enterprise Operations Portal | **Connected Vehicle Intelligence Platform** | Official category description |
| **Domain Term** | `fleet` / `fleet management` | **fleet / fleet management** | Core business domain concept; must not be renamed |
| **Domain Term** | `fleet_id` / `vehicleId` | **fleet_id / vehicleId** | Data schema identifier |
| **Application ID** | `fleetiq-backend` | **`vehyron-backend`** | Maven artifact and Spring application identifier |
| **Application ID** | `fleetiq-frontend` | **`vehyron-frontend`** | `package.json` project name |
| **Database Name** | `fleetiq` | **`vehyron`** | PostgreSQL production database name |
| **Docker Containers** | `fleetiq-backend`, `fleetiq-frontend` | **`vehyron-backend`**, **`vehyron-frontend`**, **`vehyron-postgres`** | Docker Compose service names |
| **Environment Vars** | `FLEETIQ_JWT_SECRET`, etc. | **`VEHYRON_JWT_SECRET`**, **`VEHYRON_INGESTION_API_KEY`** | Environment variables (with legacy fallback) |
| **AI Copilot** | FleetIQ Intelligence Copilot | **VEHYRON Intelligence Copilot** | System prompt and workspace branding |
| **Legal Entity** | FleetIQ Technologies | **[LEGAL ENTITY NAME] — LEGAL REVIEW REQUIRED** | Placeholder for formal legal review |

---

## 3. Implementation Matrix

### 3.1. Authentication & Role Model
- **Strictly Dual Roles**: `ROLE_ADMIN` and `ROLE_OPERATOR`. Deprecated all legacy roles (`ROLE_VIEWER`, `ROLE_OPERATIONS_LEAD`).
- **Signup Role Selection**: Public self-service registration defaults strictly to `ROLE_OPERATOR`. Selecting `Admin` flags the account for administrator approval.
- **Login Role Selection**: Dropdown provides "Sign in as" (`Operator` / `Admin`). The backend strictly validates the requested role against the database principal. Mismatch returns a generic, secure response: *"The selected account type does not match your account."*
- **Real-Time RBAC**: Admin-only routes (`/api/v1/admin/**`, `/api/v1/ingestion/**`) strictly reject `ROLE_OPERATOR` with HTTP 403 Forbidden.

### 3.2. Elimination of Static / Demo Data
- **Backend Seeding Disabled**: `vehyron.seed.enabled` set to `false`. Initial database startup creates only platform governance accounts (`admin` and `operator`) with zero synthetic vehicles.
- **Dynamic Fleet Health & Asset Calculations**:
  - `FleetOverviewCards.tsx`: If `totalVehicles === 0`, displays "0 registered", "Insufficient data" for health/utilization, and "$0" estimated risk.
  - `FleetHealthSection.tsx`: Shows clean empty state prompting data source connection or dataset upload.
  - `VehicleTable.tsx`: Shows: *"No vehicles have been ingested yet. Connect a real-time IoT / OEM data source or upload an Excel/CSV dataset to populate the asset registry."*
  - `LiveOperationsPanel.tsx`: Shows: *"Waiting for incoming telemetry... Live event stream is active and awaiting external vehicle signals."*
  - `PriorityActionCenter.tsx`: Shows: *"No operational actions queued. Telemetry events and diagnostic issues will generate priority actions here."*

### 3.3. Database & Migrations
- **Flyway Migration `V4__data_sources_and_ingestion_jobs.sql`**:
  - `data_sources`: Configured ingestion gateways (Kafka, MQTT, REST, Webhooks, Pub/Sub, Kinesis, Event Hubs, Excel/CSV).
  - `ingestion_jobs`: Traceability and audit records for batch and stream processing jobs.

### 3.4. Data Source Connectors & Gateway
- Created `com.fleetiq.service.ingestion.DataSourceConnector` contract.
- Implemented:
  1. `KafkaDataSourceConnector`: Apache Kafka cluster topic subscription.
  2. `MqttDataSourceConnector`: MQTT v3/v5 broker connection with topic wildcard resolution.
  3. `RestApiDataSourceConnector`: Scheduled OEM API poller with backoff.
  4. `WebhookDataSourceConnector`: Secure webhook endpoint with HMAC signature validation.
  5. `CloudPubSubDataSourceConnector`: Google Cloud Pub/Sub integration.
  6. `AwsKinesisDataSourceConnector`: Amazon Kinesis Data Streams integration.
  7. `AzureEventHubsDataSourceConnector`: Microsoft Azure Event Hubs integration.
  8. `ExcelCsvIngestionService`: Streaming Apache POI (.xlsx) and Apache Commons CSV parser with auto-column mapping.

### 3.5. Multi-OEM Normalization & Module Routing
- Created `CanonicalVehyronAdapter`: Normalizes heterogeneous external payloads into immutable `CanonicalVehicleEvent` entities.
- Updated `EventProcessingService`: Auto-registers newly ingested vehicles in `VehicleRepository` dynamically on the fly so they appear across:
  - Fleet Asset Registry
  - Live Operations Telemetry
  - Diagnostics Hub
  - Priority Action Center
  - Fleet Health Index
  - SSE Real-Time Stream

### 3.6. Admin Data Ingestion Center UI
- Created `frontend/src/components/admin/DataIngestionCenter.tsx`:
  - **Overview & Active Sources**: Real-time status cards, live throughput, and data freshness badges (`LIVE`, `WEBHOOK`, `STREAM`, `IMPORTED`, `OFFLINE`, `STALE`).
  - **Add Connector Guided Wizard**: 3-step wizard with broker configuration, handshake connection test, and schema mapping.
  - **Batch File Upload (Excel/CSV)**: Drag & drop with automatic column mapping preview and sample record table.
  - **Ingestion Jobs History**: Audit trail of processed and rejected records.
  - **Dead-Letter Queue & Replay**: Forensic inspection of raw un-normalized records with 1-click pipeline re-injection.
  - **Data Quality Dashboard**: Pass rates, validation error metrics, and deduplication statistics.

---

## 4. Verification Results

### Backend Automated Test Suites
- `VehyronIngestionPipelineTests`: End-to-end connector lifecycle, webhook auto-registration, CSV batch upload, and dead-letter replay.
- `AuthenticationAndSessionTests`: Login, registration, lockout, dual tokens, password reset, and session revocation.
- `AdminUserAndRbacTests`: Dual-role authorization checks.
- `SecurityAndAuthTests`: API key verification, role mutation, and endpoint protection.

### Frontend Compilation
- `npm run build`: Production bundle compiled cleanly via `tsc && vite build` (dist size: 404 kB JS, 46 kB CSS) with 0 errors.

---

## 5. Preliminary Trademark Disclaimer
> **Legal Notice**: Preliminary name availability screening has been performed for VEHYRON. Formal trademark, domain, company name, and jurisdiction-specific legal clearance are required prior to commercial launch.
