# FleetIQ — Deployment & Release Strategy

**Target Platforms**: Docker, Docker Compose, Linux Container Environments  
**Orchestration**: `docker-compose.yml` (multi-container: PostgreSQL, Backend, Frontend)

---

## 1. Container Architecture
- **PostgreSQL Service (`fleetiq-postgres`)**:
  - Image: `postgres:15-alpine`
  - Port: `5432:5432`
  - Healthcheck: `pg_isready -U fleetiq_user -d fleetiq`
  - Volume: `postgres_data` persistent volume.
- **Backend Service (`fleetiq-backend`)**:
  - Multi-stage Docker build producing a lightweight JRE 17 runtime container.
  - Environment: `SPRING_PROFILES_ACTIVE=postgres`, connected to database container via internal Docker network.
  - Port: `8080:8080`
  - Startup Dependency: Waits on `postgres` service condition `service_healthy`.
- **Frontend Service (`fleetiq-frontend`)**:
  - Multi-stage build (Node build -> Nginx alpine runtime).
  - Port: `5173:80` (or `80:80` in production reverse proxy configuration).
  - Routes API calls to backend container.

---

## 2. Environment Configuration Matrix
| Environment Variable | Default / Local | Production Expectation | Purpose |
| :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `dev` | `postgres` | Selects database driver and profile |
| `DB_HOST` | `localhost` | `postgres` or cloud DB host | Database hostname |
| `DB_PORT` | `5432` | `5432` | Database port |
| `DB_NAME` | `fleetiq` | `fleetiq` | Database name |
| `DB_USER` | `fleetiq_user` | Injected secret | Database user |
| `DB_PASSWORD` | `fleetiq_secret` | Injected secret | Database password |
| `JWT_SECRET` | Static dev fallback | Minimum 256-bit cryptographically secure string | JWT signature secret |
| `FLEETIQ_INGESTION_API_KEY` | `fleetiq-ingest-secure-key-2026` | Injected secret | Ingestion endpoint validation |
| `JEV_API_ENABLED` | `false` | `true` | Enables upstream AI decision client |
| `JEV_API_KEY` | Empty | Injected secret | JEV AI API authentication |

---

## 3. Deployment Runbook & Health Verification
```bash
# 1. Build and start containers in detached mode:
docker-compose up -d --build

# 2. Check health of PostgreSQL and backend services:
docker-compose ps
curl -s http://localhost:8080/actuator/health | grep UP

# 3. Verify frontend UI availability:
curl -I http://localhost:5173

# 4. View container logs:
docker-compose logs -f fleetiq-backend
```

---

## 4. Rollback & Disaster Recovery
- **Database Backup**: Regular `pg_dump` snapshots of `postgres_data` volume.
- **Graceful Shutdown**: Spring Boot is configured with graceful shutdown to drain active HTTP requests and SSE connections without abrupt termination.
- **Rollback Procedure**: In case of a bad release, redeploy the previous tagged Docker image (`docker-compose down && docker-compose up -d <previous-tag>`).
