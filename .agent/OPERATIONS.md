# VEHYRON — Production Operations Runbook

**Operational State**: Active  
**Maintenance SLA**: 99.9% Uptime for Dispatch Visibility

---

## 1. Reliability & Resilience Policies

### 1.1 Health, Liveness & Readiness Checks
- Spring Boot Actuator endpoints provide standard Kubernetes-ready probes:
  - **Liveness Probe**: `GET /actuator/health/liveness` — verifies the JVM process is responsive and not deadlocked.
  - **Readiness Probe**: `GET /actuator/health/readiness` — verifies database connections are available before traffic is routed.

### 1.2 Graceful Shutdown
- Spring Boot server is configured to finish in-flight requests and allow SSE connections to close cleanly before terminating the JVM process.

### 1.3 Retry & Timeout Policies
- **External AI Decision Service (`JevDecisionService`)**:
  - Request timeout strictly enforced at `3000ms`.
  - Max retries: 1 retry with exponential backoff before immediately activating `RuleBasedDecisionService`.
- **Database Connection Pool (HikariCP)**:
  - Connection timeout: `30,000ms`.
  - Maximum pool size: 10 connections (in dev), sized to concurrent thread workload in production.

### 1.4 Failure Isolation & Circuit Breaking
- Failure in the external AI decision service is isolated completely from telemetry ingestion:
  - A failure to reach `api.jev.ai` does NOT fail the HTTP response to the telematics simulator or OEM webhook.
  - The hybrid decision pipeline catches the failure, logs a `WARN`, and completes the transaction using deterministic rules.

---

## 2. Standard Operational Procedures

### 2.1 Starting Local Development
```bash
# Terminal 1: Backend (Runs on localhost:8080 with embedded H2)
cd backend
mvn spring-boot:run

# Terminal 2: Frontend (Runs on localhost:5173 with Vite proxy)
cd frontend
npm run dev
```

### 2.2 Triggering Telemetry Simulator
```bash
# Generate synthetic batch of multi-OEM events:
curl -X POST http://localhost:8080/api/v1/simulator/generate \
  -H "Content-Type: application/json" \
  -d '{"vehicleCount": 30, "eventCount": 60, "seed": 20260925}'

# Trigger specific fault scenario (e.g., critical battery degradation):
curl -X POST http://localhost:8080/api/v1/simulator/scenario/critical-battery
```

### 2.3 Investigating Alerts & Fallbacks
- To see all decisions that triggered the deterministic fallback:
```sql
SELECT decision_id, vin, recommended_action, reasoning, timestamp 
FROM decisions 
WHERE decision_source = 'DETERMINISTIC_RULES' 
ORDER BY timestamp DESC LIMIT 20;
```
