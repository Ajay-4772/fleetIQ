# FleetIQ — Production Deployment & Infrastructure Guide

**Document Version:** 1.0.0-PROD  
**Classification:** DevOps / Infrastructure  
**Audience:** Site Reliability Engineers, Cloud Architects

---

## 1. Environment Configurations

FleetIQ maintains strict environment segregation:

| Property | Development | Staging | Production |
| :--- | :--- | :--- | :--- |
| **Spring Profile** | `dev` / `postgres` | `staging` | `prod` |
| **Database** | Docker PostgreSQL 15 | Managed RDS PostgreSQL (Multi-AZ) | Managed RDS PostgreSQL (Multi-AZ + Read Replicas) |
| **JWT Secret** | Dev Mock Key (`fleetiq-dev-secret-key-123456789`) | Vault Injected | AWS Secrets Manager / KMS |
| **AI Provider** | `DeterministicGroundedProvider` | `DeterministicGroundedProvider` | `JevAIProvider` / Grounded Fallback |
| **Rate Limiting** | In-Memory Token Bucket | In-Memory / Redis Cluster | Distributed Redis Cluster |

---

## 2. Docker Container Packaging

### Multi-Stage Container Builds
```bash
# Build Backend Container Image
docker build -t [REGISTRY_HOST]/fleetiq-backend:1.0.0 -f backend/Dockerfile backend/

# Build Frontend Container Image (Vite static assets served by Nginx Alpine)
docker build -t [REGISTRY_HOST]/fleetiq-frontend:1.0.0 -f frontend/Dockerfile frontend/
```

### Full-Stack Docker Compose Deployment
```bash
# Launch entire stack locally or on a single staging host
docker compose up -d --build

# Verify container health
docker compose ps
docker compose logs -f fleetiq-backend
```

---

## 3. Kubernetes / Cloud Deployment Pattern (Target)

In production Kubernetes clusters:
- Backend pods run as a `Deployment` with horizontal pod autoscaling (HPA) targeting 70% CPU utilization.
- Frontend static assets are deployed to Amazon S3 / CloudFront CDN or as Nginx pods.
- Readiness probe targets: `http://localhost:8080/actuator/health/readiness`
- Liveness probe targets: `http://localhost:8080/actuator/health/liveness`
- Pod graceful termination window: 30 seconds (`terminationGracePeriodSeconds: 30`).
