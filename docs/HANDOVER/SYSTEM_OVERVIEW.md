# FleetIQ — Complete System Overview

**Document Version:** 1.0.0-PROD  
**Classification:** Product Overview  
**Audience:** Technical Leadership, Product Managers, Engineering Teams

---

## 1. Business Problem & Solution

### The Multi-OEM Telematics Challenge
Modern commercial fleets comprise diverse vehicle makes (Toyota hybrids, Ford internal combustion/electric transit vans, BMW sedans, Tesla battery electric vehicles). Each manufacturer emits incompatible sensor feeds, proprietary Diagnostic Trouble Codes (DTC), and varying telemetry frequencies. Fleet operators face data fragmentation, alarm fatigue, and missed preventative maintenance windows.

### The FleetIQ Solution
FleetIQ provides a single, unified enterprise operations platform:
1. **Multi-OEM Normalization:** Ingests raw telemetry payloads and maps them into a canonical `VehicleEvent` data model.
2. **Deterministic Priority Action Center:** A rule-based decision engine evaluates vehicle sensor readings against hard safety invariants (e.g., High Voltage battery temperature, critical brake wear) to automatically generate prioritized work orders with human review workflows.
3. **Intelligence Copilot:** A full-page ChatGPT-style conversational assistant grounded in live database state and manufacturer technical service bulletins via RAG.
4. **Identity & Access Governance:** Enterprise JWT authentication with server-side Role-Based Access Control (RBAC), user lifecycle administration, and immutable audit logs.
5. **Real-time Observability:** Live Server-Sent Events (SSE) stream broadcasting vehicle state changes to connected operational dispatchers with sub-second latency.

---

## 2. Platform Modules & Interfaces

- **Frontend Application (`frontend/`):** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite build tooling. Clean enterprise design without distracting animations.
- **Backend Application (`backend/`):** Java 17, Spring Boot 3.3.2, Spring Security, Spring Data JPA, HikariCP, Flyway migration engine.
- **Database Engine (`database/`):** PostgreSQL 15 relational database with version-controlled Flyway schema scripts.
- **Development Tooling:** Multi-stage Dockerfiles, Docker Compose, VS Code Dev Container, GitHub Actions CI.
