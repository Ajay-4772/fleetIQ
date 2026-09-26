# VEHYRON — Disaster Recovery & Business Continuity Plan

**Classification:** Enterprise SRE & Operations Runbook  
**Target Organization:** Platform Engineering, SRE, and Infrastructure Operations  
**Compliance Standard:** ISO 27001 / SOC 2 Type II Business Continuity Controls  
**Effective Date:** September 2026  

---

## 1. Recovery Objectives (RPO & RTO)

| Service Domain | RPO (Data Loss Target) | RTO (Downtime Target) | Recovery Strategy |
| :--- | :---: | :---: | :--- |
| **PostgreSQL Primary Database** | **≤ 5 Minutes** | **≤ 15 Minutes** | Continuous WAL archiving + Multi-AZ hot standby + Automated point-in-time recovery (PITR). |
| **Backend API Services** | **0 Minutes (Stateless)** | **≤ 5 Minutes** | Container orchestration (ECS / Kubernetes) auto-healing across multiple availability zones. |
| **Frontend Web Portal** | **0 Minutes (Stateless)** | **≤ 2 Minutes** | Edge CDN (Cloudflare / CloudFront) caching with S3/Nginx origin failover. |
| **Real-Time Telemetry Ingestion** | **≤ 1 Minute** | **≤ 10 Minutes** | Queue buffering (Kafka / Cloud PubSub) with 7-day retention for replay. |
| **Secrets & Encryption Vault** | **0 Minutes** | **≤ 5 Minutes** | Replicated Cloud KMS / HashiCorp Vault multi-region clusters. |

---

## 2. PostgreSQL Disaster Recovery Runbook

### A. Backup Architecture & Retention
1. **Automated Continuous Archiving:** Write-Ahead Logs (WAL) streamed continuously to an encrypted multi-region object storage bucket (`AES-256-GCM`).
2. **Daily Physical Snapshots:** Executed every 24 hours at 01:00 UTC using `pg_dump`:
   ```bash
   pg_dump -Fc -h $DB_HOST -U $DB_USER -d vehyron -f /var/backups/vehyron_$(date +%Y%m%d_%H%M%S).dump
   ```
3. **Retention Policy:**
   - 30 days of continuous PITR capability.
   - 12 monthly immutable archives stored under WORM (Write Once, Read Many) compliance locking.

### B. Full Database Restoration Sequence
```bash
# Step 1: Provision a clean target database instance
createdb -h $TARGET_HOST -p 5432 -U $DB_USER vehyron_restored

# Step 2: Restore from latest validated backup archive
pg_restore -h $TARGET_HOST -p 5432 -U $DB_USER -d vehyron_restored -v /var/backups/vehyron_latest.dump

# Step 3: Run Flyway migration validation to ensure schema version parity
mvn flyway:migrate -f backend/pom.xml \
  -Dflyway.url=jdbc:postgresql://$TARGET_HOST:5432/vehyron_restored \
  -Dflyway.user=$DB_USER \
  -Dflyway.password=$DB_PASSWORD

# Step 4: Verify row count integrity across critical tables
psql -h $TARGET_HOST -U $DB_USER -d vehyron_restored -c "
  SELECT 'users' AS tbl, count(*) FROM users
  UNION ALL SELECT 'vehicles', count(*) FROM vehicles
  UNION ALL SELECT 'canonical_vehicle_events', count(*) FROM canonical_vehicle_events;
"
```

---

## 3. Application & Infrastructure Recovery

### A. Backend Container Recovery
- **Stateless Design:** Backend instances do not store persistent session state on disk; all user sessions reside in JWTs and PostgreSQL `refresh_tokens`.
- **Automated Rolling Restart:**
  ```bash
  docker compose down
  docker compose up -d --build
  ```
- **Health Verification:**
  ```bash
  curl -f http://localhost:8080/actuator/health
  # Expected: {"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"}}}
  ```

### B. Secrets & Cryptographic Recovery
1. In the event of primary secret vault failure, emergency configuration keys are injected via secure environmental variables (`JWT_SECRET`, `VEHYRON_INGESTION_API_KEY`, `DB_PASSWORD`).
2. If `JWT_SECRET` is compromised, rotate the secret immediately. All active access tokens will instantly become invalid, forcing users to re-authenticate via valid `refresh_tokens` or credential login.

### C. DNS & Traffic Routing Failover
- Primary domain `api.vehyron.com` and `app.vehyron.com` are managed via Route 53 / Cloudflare with health-check failover routing policies.
- If Primary Region fails, DNS latency routing shifts incoming dispatchers to Secondary Region within 60 seconds.

---

## 4. External Dependency Outages

| Dependency | Outage Impact | System Behavior | Recovery Action |
| :--- | :--- | :--- | :--- |
| **External OEM Telematics API** | Incoming vehicle data stalls for that specific OEM. | Ingestion poller backs off with exponential jitter; alerts flagged as `STALE`. | Poller resumes automatically when external endpoint returns `200 OK`. |
| **AI / Cloud LLM Provider** | Copilot natural language queries slow or fail. | Automatic fallback to `DeterministicGroundedProvider` within 1500ms; zero downtime. | Switch to secondary provider or restore API keys once provider recovers. |
| **Kafka / Message Broker** | Telemetry ingestion queue backs up. | Ingestion gateway buffers events into memory / local retry table; returns `202 Accepted`. | Kafka consumer resumes from last committed offset; replays backlog. |

---

## 5. Semi-Annual Disaster Recovery Drill

To guarantee that disaster recovery runbooks remain valid:
1. **Frequency:** Every 6 months.
2. **Simulation:** Terminate primary database container/host in staging environment without prior notice.
3. **Pass Criteria:**
   - Database restored from backup within **15 minutes**.
   - Zero corrupted vehicle records.
   - All 78 backend tests pass against the restored database instance.
   - Dispatcher portal resumes live telemetry streaming within **3 minutes** of DB restoration.
