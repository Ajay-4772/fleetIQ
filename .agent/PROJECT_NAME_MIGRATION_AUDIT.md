# VEHYRON — Project Name & Identity Migration Audit

**Date**: September 25, 2026  
**Status**: AUDIT COMPLETE — MIGRATION IN PROGRESS  
**Target Identity**: **VEHYRON — Connected Vehicle Intelligence Platform**  
**Previous Brand**: FleetIQ / Fleet IQ / fleetiq / FLEETIQ / fleet-iq

---

## 1. Executive Summary

This audit establishes the comprehensive inventory of brand, product, service, and infrastructural identifiers undergoing migration from **FleetIQ** to **VEHYRON**. 

### Critical Invariant: Brand vs. Domain Disambiguation
- **PRODUCT BRAND (MIGRATE TO VEHYRON)**:
  - Application titles, UI logos, browser titles, metadata, Open Graph tags.
  - Product descriptors ("FleetIQ Connected Vehicle Intelligence Platform" → "VEHYRON Connected Vehicle Intelligence Platform").
  - System prompts, AI Copilot branding ("FleetIQ intelligence assistant" → "VEHYRON intelligence assistant").
  - Authentication headers, sign-in/sign-up forms, password reset emails, legal drafts (Terms, Privacy, Security).
  - Backend application identifiers (`fleetiq-backend` → `vehyron-backend`, `fleetiq-frontend` → `vehyron-frontend`).
  - Container names, Docker images, and database identifiers (`fleetiq` DB/user → `vehyron` DB/user).
- **DOMAIN TERMINOLOGY (STRICTLY PRESERVE AS-IS)**:
  - `fleet`, `vehicle`, `fleet_id`, `fleet management`, `fleet health`, `fleet overview`, `fleet asset registry`, `/api/fleet/**`.
  - These are legitimate automotive/logistics domain concepts and are **NOT** to be replaced with "vehyron".
- **CODE NAMESPACES**:
  - Java base package `com.fleetiq.*` represents internal code structure. Changing package directories carries severe refactoring and bytecode breaking risks without user-facing value. It is classified under *Code Namespace Separation* and retained, while Maven artifact names and application names are upgraded.

---

## 2. Comprehensive Inventory by Layer

### A. Frontend Layer (`frontend/`)
| Location | Current Identifier | Target Replacement | Classification |
| :--- | :--- | :--- | :--- |
| `frontend/index.html` | `<title>FleetIQ — Operations Intelligence Center</title>` | `<title>VEHYRON — Connected Vehicle Intelligence Platform</title>` | Product Brand |
| `frontend/index.html` | `<meta name="description" content="Connected Vehicle...">` | `<meta name="description" content="VEHYRON — Multi-OEM vehicle telemetry, event normalization, operational intelligence and AI-assisted decision engineering platform.">` | SEO / Metadata |
| `frontend/package.json` | `"name": "fleetiq-frontend"` | `"name": "vehyron-frontend"` | Package Metadata |
| `frontend/src/components/layout/Header.tsx` | Logo text: "FleetIQ" | "VEHYRON" (with subtitle "Connected Vehicle Intelligence") | Product Brand |
| `frontend/src/components/auth/LoginPage.tsx` | "FleetIQ", "FleetIQ Operations Center", "FleetIQ Account" | "VEHYRON", "VEHYRON Operations Center", "VEHYRON Account" | Product Brand |
| `frontend/src/components/copilot/CopilotWorkspace.tsx` | "FleetIQ AI Copilot", "FleetIQ Operations Intelligence" | "VEHYRON Copilot", "VEHYRON Connected Intelligence" | AI Branding |
| `frontend/src/components/intelligence/IntelligenceHub.tsx` | "FleetIQ Intelligence" | "VEHYRON Intelligence" | Product Brand |
| `frontend/src/components/system/SystemStatusPages.tsx` | "FleetIQ Service Status", "FleetIQ Support" | "VEHYRON Service Status", "VEHYRON Support" | Product Brand |
| `frontend/src/components/system/LegalModal.tsx` | "FleetIQ Technologies Inc.", "FleetIQ Platform" | "[LEGAL ENTITY NAME]", "VEHYRON Platform" | Legal / Compliance |
| `frontend/src/context/AuthContext.tsx` | Storage key `fleetiq_auth_token` | `vehyron_auth_token` (with backward compat read) | Client Storage |
| `frontend/src/services/api.ts` | Header defaults, error messages | Updated to VEHYRON | Client API |

### B. Backend Layer (`backend/`)
| Location | Current Identifier | Target Replacement | Classification |
| :--- | :--- | :--- | :--- |
| `backend/pom.xml` | `<artifactId>fleetiq-backend</artifactId>` | `<artifactId>vehyron-backend</artifactId>` | Build Metadata |
| `backend/pom.xml` | `<name>fleetiq-backend</name>` | `<name>vehyron-backend</name>` | Build Metadata |
| `backend/pom.xml` | `<description>FleetIQ Connected...</description>` | `<description>VEHYRON Connected Vehicle Intelligence Platform</description>` | Build Metadata |
| `backend/src/main/resources/application.yml` | `spring.application.name: fleetiq-backend` | `spring.application.name: vehyron-backend` | Application Identifier |
| `backend/src/main/resources/application.yml` | `logging.pattern.level: fleetiq-backend` | `logging.pattern.level: vehyron-backend` | Logging / Tracing |
| `backend/src/main/resources/application.yml` | `datasource.url: jdbc:h2:mem:fleetiq...` | `jdbc:h2:mem:vehyron...` | Dev Database Name |
| `backend/src/main/resources/application.yml` | `DB_NAME: fleetiq`, `DB_USER: fleetiq_user` | `DB_NAME: vehyron`, `DB_USER: vehyron_user` | Prod Database Name |
| `backend/src/main/resources/application.yml` | `JWT_SECRET: FleetIQSecretKey...` | `VEHYRON_SECRET_KEY...` | Environment Config |
| `backend/src/main/resources/application.yml` | `fleetiq.security.ingestion-api-key` | `vehyron.security.ingestion-api-key` (with fallback) | Ingestion Config |
| `backend/src/main/resources/knowledge/*.md` | "FleetIQ Platform Architecture", "FleetIQ Operations" | "VEHYRON Platform Architecture", "VEHYRON Operations" | Grounded AI RAG Docs |
| `backend/src/main/java/com/fleetiq/service/ai/CopilotService.java` | "You are the FleetIQ intelligence assistant..." | "You are the VEHYRON intelligence assistant..." | System Prompt |

### C. Docker & Infrastructure Layer
| Location | Current Identifier | Target Replacement | Classification |
| :--- | :--- | :--- | :--- |
| `docker-compose.yml` | `container_name: fleetiq-postgres` | `container_name: vehyron-postgres` | Infrastructure |
| `docker-compose.yml` | `POSTGRES_DB: fleetiq` | `POSTGRES_DB: vehyron` | Database Name |
| `docker-compose.yml` | `POSTGRES_USER: fleetiq_user` | `POSTGRES_USER: vehyron_user` | Database User |
| `docker-compose.yml` | `POSTGRES_PASSWORD: fleetiq_secret` | `POSTGRES_PASSWORD: vehyron_secret` | Database Credentials |
| `docker-compose.yml` | `fleetiq-backend`, `container_name: fleetiq-backend` | `vehyron-backend`, `container_name: vehyron-backend` | Container Service |
| `docker-compose.yml` | `fleetiq-frontend`, `container_name: fleetiq-frontend` | `vehyron-frontend`, `container_name: vehyron-frontend` | Container Service |

### D. Documentation & Specifications Layer
| Location | Current Identifier | Target Replacement | Classification |
| :--- | :--- | :--- | :--- |
| `README.md` | FleetIQ Connected Vehicle Intelligence Platform | VEHYRON Connected Vehicle Intelligence Platform | Primary Documentation |
| `docs/` (all guides) | FleetIQ references | VEHYRON references | Architecture & Handover |
| `docs/legal/` | FleetIQ Technologies Inc. | [LEGAL ENTITY NAME] (LEGAL REVIEW REQUIRED) | Compliance |
| `.agent/` | FleetIQ reports & state documents | Updated to VEHYRON | Project State & Memory |

---

## 3. Data Ingestion Architecture & Static Data Audit

### A. Static/Demo Data Locations Identified for Removal
1. `backend/src/main/java/com/fleetiq/service/DataInitializer.java`:
   - Auto-seeding of `seed-vehicles.json` when `vehicleRepository.count() == 0`.
   - Auto-execution of `simulatorService.runScenario("mixed_fleet", null)`.
   - Hardcoded demo users with quick credentials.
2. `backend/src/main/resources/seed-vehicles.json`:
   - 60 static vehicles loaded into production database on clean startup. Must be decoupled from production startup.
3. `frontend/src/components/overview/FleetOverviewCards.tsx`:
   - Hardcoded trends `+12.5%`, `+4.2%`, `+8.1%`, `-14.8%`.
4. `frontend/src/components/overview/FleetHealthSection.tsx`:
   - Hardcoded chart scrubber points `points = [...]`.
   - Hardcoded `+24.4% vs last period`.
5. `frontend/src/components/overview/RightSidebarWidgets.tsx`:
   - Hardcoded days data `Tue (8,162 km)`.
   - Hardcoded default `safetyScore = 88`.

### B. User Roles Simplification
- Current: `ROLE_ADMIN`, `ROLE_OPERATIONS_LEAD`, `ROLE_OPERATOR`, `ROLE_VIEWER`, `ROLE_INGESTION`.
- Target: Strictly **`ADMIN`** and **`OPERATOR`** (`ROLE_ADMIN` and `ROLE_OPERATOR`).
- Public registration: Defaults to `ROLE_OPERATOR`.
- Role Dropdown on Signup & Login: UI selection with strict backend enforcement.

### C. Connectors & Ingestion Gateway
- Abstract `DataSourceConnector` supporting Kafka, MQTT, REST, Webhooks, Pub/Sub, Kinesis, Event Hubs, Excel, CSV.
- Flexible schema mapping for incoming files.
- Empty database state support (0 vehicles is valid, with descriptive empty states).
- Admin Ingestion Control Center (`/admin/ingestion`, `/admin/data-sources`).

---

## 4. Legal & Trademark Clearance Notice
Preliminary screening has been performed; formal trademark, domain, company-name, and jurisdiction-specific clearance is required before commercial launch. All legal documents will use `[LEGAL ENTITY NAME]` with `LEGAL REVIEW REQUIRED`.
