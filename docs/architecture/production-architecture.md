# VEHYRON — Production Architecture & Failure Boundaries

**Classification:** Enterprise System Architecture Specification  
**Product:** VEHYRON Connected Vehicle Intelligence Platform  
**Target Architecture:** Highly Available (HA), Multi-AZ, Defense-in-Depth  

---

## 1. End-to-End Enterprise Architecture Topology

```
                                  [ INTERNET ]
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          EDGE CDN / WAF LAYER             │
                  │   Cloudflare / AWS CloudFront + AWS WAF   │
                  │   - DDoS mitigation (L3/L4/L7)            │
                  │   - TLS termination (TLS 1.3 only)        │
                  │   - Edge rate limiting & bot management   │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │         APPLICATION LOAD BALANCER         │
                  │   AWS ALB / Nginx Reverse Proxy           │
                  │   - Health checks: /actuator/health       │
                  │   - Path routing: /api/* -> Backend       │
                  │   - Static assets -> Frontend CDN         │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
               VPC PRIVATE SUBNET (MULTI-AZ: AZ-a & AZ-b)
         ┌─────────────────────────────────────────────────────────┐
         │                                                         │
         │   ┌──────────────────────┐   ┌──────────────────────┐   │
         │   │ VEHYRON BACKEND POD  │   │ VEHYRON BACKEND POD  │   │
         │   │  (Spring Boot 3.3)   │   │  (Spring Boot 3.3)   │   │
         │   │  - Stateless JWT     │   │  - Stateless JWT     │   │
         │   │  - Normalization     │   │  - Normalization     │   │
         │   │  - Decision Engine   │   │  - Decision Engine   │   │
         │   └──────────┬───────────┘   └──────────┬───────────┘   │
         │              │                          │               │
         │              └────────────┬─────────────┘               │
         │                           │                             │
         │                           ▼                             │
         │            ┌─────────────────────────────┐              │
         │            │   REDIS DISTRIBUTED CLUSTER │              │
         │            │   - Distributed rate limits │              │
         │            │   - SSE Pub/Sub backplane   │              │
         │            │   - Token blacklist TTL     │              │
         │            └──────────────┬──────────────┘              │
         │                           │                             │
         │                           ▼                             │
         │            ┌─────────────────────────────┐              │
         │            │  POSTGRESQL PRIMARY (WRITER)│              │
         │            │   Multi-AZ RDS / Cloud SQL  │              │
         │            │   - Flyway Migrations V1-V4 │              │
         │            │   - Hikari Connection Pool  │              │
         │            └──────────────┬──────────────┘              │
         │                           │ (Streaming Replication)     │
         │                           ▼                             │
         │            ┌─────────────────────────────┐              │
         │            │  POSTGRESQL STANDBY (READER)│              │
         │            │   Read Replicas for Reports │              │
         │            └─────────────────────────────┘              │
         └─────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                     EXTERNAL INTEGRATIONS & SERVICES
         ┌─────────────────────────────────────────────────────────┐
         │ - Kafka Broker / MQTT IoT Gateway (Streaming Telemetry) │
         │ - Cloud KMS / HashiCorp Vault (Cryptographic Secrets)   │
         │ - Upstream AI LLM / JEV API (Bounded 1500ms Fallback)   │
         │ - Prometheus / Grafana / Datadog (Metrics & Tracing)   │
         └─────────────────────────────────────────────────────────┘
```

---

## 2. Component Roles & Failure Boundaries

### A. Edge CDN & Web Application Firewall (WAF)
- **Role:** Shields application pods from direct public IP exposure; terminates TLS; mitigates volumetric DDoS attacks (SYN floods, UDP amplification); inspects HTTP request bodies against OWASP Core Rule Set (CRS).
- **Failure Boundary:** If edge WAF is compromised or fails, secondary ingress routing directly to the ALB remains available via protected origin certificates.

### B. VEHYRON Backend Application Pods
- **Role:** Stateless application workers running Java 17. Handles authentication, RBAC authorization, telemetry normalization, rule decisioning, SSE broadcasting, and data quality metrics.
- **Failure Boundary:** Completely stateless. Any pod crash or OOM condition triggers automatic replacement by container orchestrator within 5 seconds without user session loss.

### C. PostgreSQL Relational Persistence Tier
- **Role:** Authoritative ACID persistence for vehicles, users, refresh tokens, audit logs, and canonical vehicle events.
- **Failure Boundary:** Multi-AZ synchronous replication. If the primary database instance suffers hardware failure, automated failover promotes the standby replica in under 60 seconds with RPO ≤ 5 minutes.

### D. Redis Distributed Clustering
- **Role:** High-speed cache for distributed sliding-window rate limits, token revocation lookups, and multi-node SSE event fan-out.
- **Failure Boundary:** Safe graceful degradation. If Redis becomes temporarily unreachable, the application falls back to local in-memory sliding window counters; core vehicle operations and authentication continue functioning.

### E. Telemetry Ingestion Gateway & Queues
- **Role:** Ingests live streams from Kafka, MQTT, Webhooks, REST pollers, and batch uploads.
- **Failure Boundary:** Independent bounded queues. If incoming event volume exceeds 20,000 events/sec, excess payloads are throttled with HTTP 429 or buffered in message broker without memory exhaustion.

### F. Grounded AI / LLM Decision Layer
- **Role:** Synthesizes vehicle diagnostic history and technical manuals to generate natural language explanations and operational recommendations.
- **Failure Boundary:** Strict 1500ms timeout bulkhead. If external cloud LLM is slow, down, or returns errors, the system automatically falls back to `RuleBasedDecisionService` with zero downtime.

---

## 3. Defense-in-Depth Matrix

| Layer | Primary Defensive Technologies |
| :--- | :--- |
| **Network** | Private VPC subnets, security groups allowing port 8080 only from ALB, TLS 1.3. |
| **Transport** | HTTPS only, Strict-Transport-Security (`HSTS`), Content-Security-Policy (`CSP`). |
| **Identity** | Stateless JWT (15-min TTL) + PostgreSQL stateful rotatable refresh tokens (7-day TTL). |
| **Authorization** | Strict backend RBAC (`ROLE_ADMIN` vs `ROLE_OPERATOR`) on every endpoint. |
| **Data Hygiene** | Strict physical sensor boundary validation, sanitization of file uploads. |
| **Storage** | AES-256 encryption at rest on PostgreSQL EBS volumes and WAL S3 buckets. |
| **Auditing** | Non-repudiable audit logging in `user_audit_logs` and MDC trace correlation. |
