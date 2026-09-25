# FleetIQ — Master Engineering Handover Guide

**Document Version:** 1.0.0-PROD  
**Classification:** Complete Software Product Handover  
**Target Organization:** Enterprise Engineering, SRE, and Operations Teams

---

## 1. Executive Handover Statement

This guide formally transfers ownership of **FleetIQ** — a multi-OEM telematics ingestion, automated priority decisioning, and grounded intelligence copilot platform.

### Core Handover Tenet: IDE Independence
FleetIQ does **not** depend on Antigravity or any proprietary AI coding tool. The entire product is contained in this repository:
- **Source Code:** Standard Java 17 / Spring Boot backend and React / TypeScript / Vite frontend.
- **Reproducible Environments:** Provided via `.devcontainer/` (Docker-in-Docker, Java 17, Node 20) and `docker-compose.yml`.
- **Database Migrations:** Managed exclusively through version-controlled Flyway scripts (`backend/src/main/resources/db/migration/`).
- **CI/CD:** Automated via GitHub Actions (`.github/workflows/ci.yml`).
- **Security:** Governed by stateless JWT authentication, server-side RBAC, and rate-limiting filters.
- **Operational Procedures:** Fully codified in standard Markdown runbooks in `docs/operations/` and `docs/HANDOVER/`.

Any engineer equipped with VS Code, IntelliJ IDEA, or GitHub Codespaces can clone, test, build, deploy, and maintain this platform.

---

## 2. Handover Package Navigation Index

| Document | Primary Audience | Key Topics Covered |
| :--- | :--- | :--- |
| [`SYSTEM_OVERVIEW.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/SYSTEM_OVERVIEW.md) | Leadership / Architects | Product capabilities, business problems solved, high-level components. |
| [`ARCHITECTURE_OVERVIEW.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/ARCHITECTURE_OVERVIEW.md) | Architects / Tech Leads | Multi-tier architecture, data flow, canonical event models, normalization. |
| [`DEVELOPMENT_GUIDE.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/DEVELOPMENT_GUIDE.md) | Developers | Local setup, building, running tests, devcontainer, Git branching rules. |
| [`DEPLOYMENT_GUIDE.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/DEPLOYMENT_GUIDE.md) | DevOps / SRE | Container build pipelines, staging setup, production Kubernetes / ECS deploy. |
| [`OPERATIONS_GUIDE.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/OPERATIONS_GUIDE.md) | Operations / SRE | Health checks, metrics scraping, log aggregation, scaling adjustments. |
| [`SECURITY_HANDOVER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/SECURITY_HANDOVER.md) | Security Engineers | RBAC policies, JWT key rotation, rate-limiting tiers, vulnerability reporting. |
| [`AI_HANDOVER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/AI_HANDOVER.md) | AI Engineers | AI model abstraction, deterministic fallback, factual JEV audit, RAG corpus. |
| [`DATABASE_HANDOVER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/DATABASE_HANDOVER.md) | Database Admins (DBA) | PostgreSQL schema, Flyway migrations, indexing, connection pooling, backups. |
| [`MONITORING_HANDOVER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/MONITORING_HANDOVER.md) | Observability / SRE | Prometheus metrics, OpenTelemetry tracing, Grafana dashboard configuration. |
| [`INCIDENT_HANDOVER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/INCIDENT_HANDOVER.md) | On-Call Engineers | Sev-1 to Sev-4 taxonomy, triage runbooks, rollback procedures, postmortems. |
| [`DISASTER_RECOVERY.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/DISASTER_RECOVERY.md) | Infrastructure Leads | RPO/RTO targets, offsite backup restoration, multi-AZ failover drills. |
| [`THIRD_PARTY_SERVICES.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/THIRD_PARTY_SERVICES.md) | Procurement / IT | Inventory of external dependencies, billing ownership, credential locations. |
| [`CREDENTIALS_AND_SECRETS.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/CREDENTIALS_AND_SECRETS.md) | SecOps | Secret manager integration, zero-plaintext policy, credential rotation. |
| [`KNOWN_LIMITATIONS.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/KNOWN_LIMITATIONS.md) | Product Managers | Unimplemented external LLMs, single-node rate limiting, roadmap items. |
| [`OWNERSHIP_TRANSFER.md`](file:///c:/Users/ajaya/Desktop/fleetiq/docs/HANDOVER/OWNERSHIP_TRANSFER.md) | Corporate IT / Legal | GitHub repo transfer, domain ownership, container registry transfer. |

---

## 3. Immediate 5-Step Getting Started Sequence

1. **Clone Repository:**
   ```bash
   git clone https://github.com/[COMPANY_ORG]/fleetiq.git
   cd fleetiq
   ```
2. **Launch Dependent Database:**
   ```bash
   docker compose up -d postgres
   ```
3. **Execute Backend Verification:**
   ```bash
   mvn clean test -f backend/pom.xml
   ```
4. **Execute Frontend Verification:**
   ```bash
   npm ci --prefix frontend
   npm run build --prefix frontend
   ```
5. **Start Development Stack:**
   ```bash
   # Terminal 1: Backend
   mvn spring-boot:run -f backend/pom.xml
   # Terminal 2: Frontend
   npm run dev --prefix frontend
   ```
   Open `http://localhost:5173` in your browser and log in with enterprise credentials (`admin` / `admin123`).
