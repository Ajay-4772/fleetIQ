# VEHYRON — Production Incident Response Plan (IRP)

**Classification:** Enterprise SRE & Security Operations Runbook  
**Severity Taxonomy:** SEV-1 (Critical) to SEV-4 (Low)  
**Standard:** NIST SP 800-61 Rev. 2 Computer Security Incident Handling Guide  

---

## 1. Incident Severity Taxonomy

| Severity | Definition | Response SLA | Examples |
| :---: | :--- | :---: | :--- |
| **SEV-1** | Critical platform outage affecting all operations; security breach. | **< 15 Mins** | Database down, complete telemetry stall, unauthorized admin access. |
| **SEV-2** | Major degradation; core feature impaired for subset of vehicles. | **< 30 Mins** | Real-time SSE disconnected, Kafka consumer crash, webhook failure. |
| **SEV-3** | Minor operational disruption with available workaround. | **< 2 Hours** | AI copilot fallback active, non-critical telemetry delayed. |
| **SEV-4** | Low-priority defect, cosmetic error, or minor telemetry warning. | **< 24 Hours** | Ingestion formatting discrepancy, UI layout alignment glitch. |

---

## 2. Standard 6-Phase Incident Handling Lifecycle

```
┌──────────────┐     ┌───────────┐     ┌─────────────┐
│ 1. DETECTION │ ──> │ 2. TRIAGE │ ──> │ 3. CONTAIN  │
└──────────────┘     └───────────┘     └─────────────┘
                                              │
┌──────────────┐     ┌───────────┐     ┌──────▼──────┐
│ 6. POST-RCA  │ <── │ 5. RECOVER│ <── │ 4. MITIGATE │
└──────────────┘     └───────────┘     └─────────────┘
```

1. **Detection:** Automated alert triggers (Prometheus / PagerDuty / Sentry) or operator reports via status portal.
2. **Triage:** Incident Commander (IC) assesses blast radius, assigns severity, and spins up dedicated bridge channel.
3. **Containment:** Isolate failing components (e.g. rate limit abusive IPs, revoke compromised tokens, open circuit breakers).
4. **Mitigation:** Deploy temporary hotfix, roll back faulty deployment, or fail over to secondary database replica.
5. **Recovery:** Verify system metrics return to baseline (`/actuator/health` returns `UP`, processing rate normal).
6. **Post-Mortem & RCA:** Blameless post-mortem published within 48 hours detailing root cause, timeline, and corrective actions.

---

## 3. Incident Scenarios & Standard Operating Procedures (SOPs)

### Scenario A: PostgreSQL Database Outage (SEV-1)
- **Symptoms:** API endpoints returning HTTP 500; `/actuator/health` reports `db: DOWN`; HikariCP connection pool timeout warnings.
- **Triage SOP:**
  1. Check database container status: `docker ps -f name=vehyron-postgres`.
  2. Inspect database logs: `docker logs --tail 100 vehyron-postgres`.
  3. Verify disk space: `df -h /var/lib/postgresql/data`.
  4. If process crashed due to OOM or resource starvation:
     ```bash
     docker compose restart postgres
     ```
  5. If database storage is corrupted, execute point-in-time recovery using [disaster-recovery.md](file:///c:/Users/ajaya/Desktop/vehyron/docs/operations/disaster-recovery.md).

### Scenario B: Security Credential Leak or Token Compromise (SEV-1)
- **Symptoms:** Unauthorized administrator logins detected in audit trail; API key observed in external logs.
- **Containment SOP:**
  1. Immediately deactivate compromised accounts via Admin API or database:
     ```sql
     UPDATE users SET enabled = false WHERE username = 'compromised_user';
     ```
  2. Revoke all active refresh tokens for the user:
     ```sql
     UPDATE refresh_tokens SET revoked = true WHERE user_id = (SELECT id FROM users WHERE username = 'compromised_user');
     ```
  3. If `JWT_SECRET` leaked: Rotate `JWT_SECRET` environment variable and restart backend pods. All active access tokens are instantly invalidated.
  4. Rotate `VEHYRON_INGESTION_API_KEY` for all external webhooks.

### Scenario C: Kafka / Streaming Ingestion Stall (SEV-2)
- **Symptoms:** Telemetry freshness badges transition from `LIVE` to `STALE`; dead-letter queue count spikes.
- **Triage SOP:**
  1. Check connector status at `GET /api/v1/ingestion/sources`.
  2. Inspect consumer logs for consumer rebalance or offset commit failures:
     ```bash
     docker logs --tail 200 vehyron-backend | grep -i kafka
     ```
  3. If Kafka broker was temporarily unreachable, restart connector via UI or API:
     ```bash
     curl -X POST http://localhost:8080/api/v1/ingestion/sources/{sourceId}/start -H "Authorization: Bearer $ADMIN_TOKEN"
     ```

### Scenario D: External OEM Telematics API Outage (SEV-3)
- **Symptoms:** Poller receives HTTP 500/503 from external Toyota/BMW/Tesla telematics endpoint.
- **Mitigation SOP:**
  1. Verify poller logs in `IngestionController`.
  2. The system automatically engages bounded exponential backoff with jitter (max 5 retries).
  3. Operator dashboard displays `STALE` badge for that OEM data stream without affecting other OEMs.

### Scenario E: Telemetry Data Corruption / Malformed Sensor Floods (SEV-2)
- **Symptoms:** Spike in rejected records on `GET /api/v1/ingestion/quality`.
- **Triage SOP:**
  1. Navigate to `/admin/ingestion` and inspect **Failed Records**.
  2. Filter by `status: REJECTED` or `VALIDATION_FAILED`.
  3. Verify offending OEM gateway schema changes.
  4. Adjust column mapping in Ingestion Gateway or apply schema update.
  5. Trigger single-click replay on dead-letter events.

### Scenario F: Faulty Deployment / Broken Build Release (SEV-1)
- **Symptoms:** High error rate immediately following a new container release.
- **Rollback SOP:**
  1. Revert container image to previous stable tag:
     ```bash
     docker compose stop vehyron-backend vehyron-frontend
     # Switch image tags in docker-compose.yml to previous release tag
     docker compose up -d
     ```
  2. Verify system health at `http://localhost:8080/actuator/health`.

---

## 4. Post-Incident Review Template
Every SEV-1 and SEV-2 incident requires a post-incident review covering:
- **Incident Summary:** Executive brief, total downtime, and impact on fleet operations.
- **Detailed Timeline:** Minute-by-minute log of alerts, triage decisions, and recovery milestones.
- **Root Cause Analysis (5 Whys):** Technical failure mechanics and systemic contributing factors.
- **Action Items & Corrective Prevention:** Specific GitHub issues created with assignees and due dates.
