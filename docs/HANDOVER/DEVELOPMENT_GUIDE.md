# FleetIQ — Engineering Development & Contributor Guide

**Document Version:** 1.0.0-PROD  
**Classification:** Developer Onboarding  
**Audience:** Software Engineers, QA Engineers

---

## 1. Prerequisites & Tooling Requirements

To develop FleetIQ locally, install:
- **Java SE Development Kit 17+** (Eclipse Temurin 17 recommended).
- **Apache Maven 3.9+**
- **Node.js 20.x LTS** and **npm 10.x+**
- **Docker & Docker Compose v2.20+**
- **IDE:** Visual Studio Code (with Remote Containers / Dev Containers) or IntelliJ IDEA Ultimate / Community.

---

## 2. Dev Container Setup (Recommended)
1. Open the repository root in VS Code.
2. When prompted: **"Folder contains a Dev Container configuration file. Reopen in Container?"**, click **Reopen in Container**.
3. VS Code constructs the container defined in `.devcontainer/Dockerfile`, mapping ports `8080`, `5173`, and `5432`.

---

## 3. Local Development Commands

### Backend Execution
```bash
# 1. Start local PostgreSQL
docker compose up -d postgres

# 2. Run unit and integration tests (57 tests)
mvn test -f backend/pom.xml

# 3. Start Spring Boot dev server
mvn spring-boot:run -f backend/pom.xml
# Backend listening on http://localhost:8080
```

### Frontend Execution
```bash
# 1. Install dependencies
npm ci --prefix frontend

# 2. Run TypeScript typecheck & production build
npm run build --prefix frontend

# 3. Start Vite dev server with hot module reload
npm run dev --prefix frontend
# Frontend listening on http://localhost:5173
```

---

## 4. Git Branching & Commit Conventions

FleetIQ follows GitHub Flow with Conventional Commits:
- `feat:` New telematics feature or API endpoint.
- `fix:` Bug fix in normalizer, decision engine, or UI.
- `refactor:` Code restructuring without functional change.
- `test:` Adding or updating unit/integration test suites.
- `docs:` Documentation or ADR modifications.
- `security:` Security patch or rate-limiting enhancement.

Every pull request must pass the automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`) prior to merge review.
