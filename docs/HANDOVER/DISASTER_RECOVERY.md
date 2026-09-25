# VEHYRON — Disaster Recovery & Backup Handover

**Document Version:** 1.0.0-PROD  
**Classification:** Disaster Recovery Reference  
**Audience:** Disaster Recovery Coordinators, SRE Leads

---

## 1. Objectives & Testing Schedule
- **RPO:** ≤ 5 minutes (WAL archiving).
- **RTO:** ≤ 15 minutes (Container redeployment and DNS failover).
- **Drill Cadence:** Biannual DR restoration drill on isolated staging VPC.

---

## 2. Recovery Checklist
1. Validate offsite S3 snapshot integrity.
2. Provision RDS standby or restore PostgreSQL container.
3. Validate Flyway schema history (`SELECT version, success FROM flyway_schema_history;`).
4. Inject production environment secrets (`JWT_SECRET`, `DB_PASSWORD`, `AI_PROVIDER_KEY`).
5. Launch backend containers and confirm `/actuator/health` returns `UP`.
6. Switch Route53 / Cloudflare DNS records to new cluster endpoint.
7. Conduct smoke test: authenticate, view fleet overview, query Copilot.
