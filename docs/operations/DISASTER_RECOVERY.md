# VEHYRON — Disaster Recovery & Business Continuity Plan

**Document Version:** 1.0.0-PROD  
**Specification:** Recovery Objectives, Backup Strategies, and Failover Runbooks

---

## 1. Service Level Objectives (RPO & RTO)

| Metric | Target | Definition |
| :--- | :---: | :--- |
| **Recovery Point Objective (RPO)** | **≤ 5 Minutes** | Maximum acceptable data loss window during catastrophic infrastructure loss. Achieved via continuous PostgreSQL Write-Ahead Log (WAL) archiving. |
| **Recovery Time Objective (RTO)** | **≤ 15 Minutes** | Maximum allowable downtime before traffic is restored. Automated via Multi-AZ container redeployment and Flyway migration verification. |

---

## 2. PostgreSQL Backup Procedures

### Continuous WAL Archiving & Daily Snapshots
1. **Automated Daily Snapshots:** Executed every 24 hours at 02:00 UTC using `pg_dump`:
   ```bash
   pg_dump -Fc -h $DB_HOST -U $DB_USER -d $DB_NAME -f /backups/fleetiq_$(date +%Y%m%d).dump
   ```
2. **Offsite Replication:** Encrypted snapshot archives (`AES-256`) are replicated to secondary geographic object storage buckets with 30-day retention policies.
3. **Database Restore Procedure:**
   ```bash
   # 1. Create fresh database instance
   createdb -h $RESTORE_HOST -U $DB_USER fleetiq_restored
   # 2. Restore schema and data from custom format archive
   pg_restore -h $RESTORE_HOST -U $DB_USER -d fleetiq_restored /backups/fleetiq_latest.dump
   # 3. Execute Flyway migration verification
   mvn flyway:migrate -Dflyway.url=jdbc:postgresql://$RESTORE_HOST:5432/fleetiq_restored
   ```

---

## 3. High Availability & Multi-AZ Deployment

- **Container Statelessness:** VEHYRON backend pods are deployed across at least two Availability Zones (AZ-a and AZ-b) managed by an Application Load Balancer with health checks pointing to `/actuator/health`.
- **Primary-Replica Failover:** AWS RDS or Cloud SQL automated failover promotes the hot-standby replica within 60 seconds if the primary database host experiences hardware degradation.
