# FleetIQ — Incident Management & On-Call Handover

**Document Version:** 1.0.0-PROD  
**Classification:** Incident Response Procedures  
**Audience:** On-Call Engineers, Incident Commanders

---

## 1. Incident Severity Classification

| Severity | Definition | Response SLA | Examples |
| :---: | :--- | :---: | :--- |
| **Sev-1** | Critical outage; multi-OEM telemetry ingestion halted or database unreachable. | **≤ 15 mins** | PostgreSQL down; API returning continuous 500 errors; auth service outage. |
| **Sev-2** | Significant operational degradation; core dashboard available but Copilot/SSE offline. | **≤ 30 mins** | SSE stream disconnection; high latency (>2s) on fleet queries. |
| **Sev-3** | Minor defect; non-critical telemetry score drift or UI styling defect. | **≤ 4 hours** | Export CSV timeout; minor edge-case normalizer parse failure. |
| **Sev-4** | Cosmetic anomaly or non-blocking request for improvement. | Next Sprint | Spelling error; documentation update. |

---

## 2. Emergency Rollback Playbook

If a new container release introduces a critical regression:

### Fast Container Rollback (Docker / Kubernetes)
```bash
# 1. Rollback backend deployment to previous stable revision
kubectl rollout undo deployment/fleetiq-backend -n production

# 2. Check rollout status
kubectl rollout status deployment/fleetiq-backend -n production

# 3. Rollback frontend deployment
kubectl rollout undo deployment/fleetiq-frontend -n production

# 4. Verify Actuator health endpoint
curl -s https://api.fleetiq.company.com/actuator/health | jq .status
```
*Database backward compatibility invariant: All Flyway migrations must be backward-compatible with N-1 backend jar releases.*
