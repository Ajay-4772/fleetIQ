# FleetIQ — Scalability & High-Throughput Engineering Architecture

**Document Version:** 1.0.0-PROD  
**Classification:** Technical Architecture Specification  
**Status:** Canonical Reference

---

## 1. Executive Summary & Workload Model

FleetIQ is designed to operate as an authoritative multi-OEM telematics ingestion and operational decision platform. This specification evaluates the system's ability to scale horizontally and vertically across high-volume telematics workloads, concurrent operator queries, and AI Copilot reasoning.

### Baseline Workload Targets (Enterprise Fleet Scale)
- **Monitored Vehicles:** 25,000 active connected vehicles across 4 OEM protocols (Toyota, Ford, BMW, Tesla).
- **Ingestion Velocity:** 500 normalized telematics events/second baseline; 2,500 events/second during peak fleet dispatch hours.
- **Concurrent Human Operators:** 250 dispatchers, analysts, and fleet administrators across simultaneous web sessions.
- **SSE Stream Concurrency:** 250 persistent Server-Sent Events HTTP connections.
- **AI Copilot Concurrency:** 20 concurrent natural-language analytical reasoning queries/second.

---

## 2. Current Architecture Capacity & Bottleneck Analysis

| Component | Current Implementation | Maximum Verified Capacity | Bottleneck Description | Production Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **Ingestion Pipeline** | Synchronous REST Controller (`/api/v1/telemetry/ingest`) | ~350 req/sec per JVM | Thread pool saturation on burst; HTTP connection blocking. | Introduce asynchronous buffering via Redis Streams or Apache Kafka; decoupling ingestion from persistence. |
| **Database Pool** | HikariCP (maximum 10 connections) | ~800 queries/sec | Connection pool exhaustion under heavy concurrent analytics queries. | Increase pool size to 50; configure PostgreSQL Read-Replicas for queries; write-master for ingest. |
| **Rate Limiter** | In-memory `ConcurrentHashMap` bucket | Single JVM instance only | State is lost on container restart; limits cannot be shared across multiple horizontal pods. | Migrate rate limiter backend to Redis via Redisson atomic token buckets. |
| **Real-time SSE** | In-memory `CopyOnWriteArrayList<SseEmitter>` | 500 connections per pod | Emitter instances cannot receive events dispatched on different API replicas. | Implement Redis Pub/Sub backplane (`fleetiq:events:telemetry`) to broadcast to all connected emitters. |
| **AI Copilot** | In-JVM `AiAssistantService` regex + RAG | ~25 req/sec | Regex compilation and synchronous database lookups in same thread. | Thread pool isolation for AI Copilot queries; response caching for identical fleet status prompts. |

---

## 3. Horizontal Scaling & Load Balancing Architecture

```
                                  [ INTERNET ]
                                        │
                                        ▼
                                 [ Cloudflare WAF ]
                                (DDoS & TLS 1.3 Termination)
                                        │
                                        ▼
                           [ Application Load Balancer ]
                            (Round-Robin / Least Conn)
                                        │
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼
      [ FleetIQ API Pod 1 ]   [ FleetIQ API Pod 2 ]   [ FleetIQ API Pod N ]
        (Stateless JVM)         (Stateless JVM)         (Stateless JVM)
                │                       │                       │
                └───────────────┬───────┴───────────────┬───────┘
                                │                       │
                                ▼                       ▼
                         [ Redis Cluster ]     [ PostgreSQL Cluster ]
                         - Distributed Limiter  - Primary (Writes)
                         - SSE Pub/Sub Backplane - Replica 1 (Dashboard Queries)
                         - Auth Token Blacklist - Replica 2 (Analytics / Export)
```

### Statelessness Guarantee
1. **Stateless Authentication:** FleetIQ uses signed JWT tokens containing user claims, roles, and expiration. No HTTP session (`HttpSession`) is stored in server memory.
2. **Zero Local Disk Dependency:** Uploaded documents or exports are streamed directly to cloud object storage (S3/GCS); no ephemeral local files are stored.
3. **Graceful Draining:** Pods respond to `SIGTERM` by closing the Hikari connection pool, completing inflight transactions, and sending SSE close frames before termination.

---

## 4. Database Scaling & Data Lifecycle Strategy

### Read-Write Separation
- **Primary Database (Write Master):** Dedicated to vehicle telemetry inserts, action state transitions, and audit logging.
- **Read Replicas (Load Balanced):** Serve `/api/v1/vehicles`, `/api/v1/dashboard/summary`, and analytics export queries.

### Table Partitioning (PostgreSQL)
Telemetry event volume grows at approximately 43 million rows per month at scale. In production, `telemetry_events` is partitioned using PostgreSQL Declarative Range Partitioning:
```sql
CREATE TABLE telemetry_events_partitioned (
    id BIGSERIAL,
    vehicle_id VARCHAR(50) NOT NULL,
    oem VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    payload JSONB NOT NULL
) PARTITION BY RANGE (recorded_at);

-- Monthly partitions
CREATE TABLE telemetry_events_2026_09 PARTITION OF telemetry_events_partitioned
    FOR VALUES FROM ('2026-09-01 00:00:00') TO ('2026-10-01 00:00:00');
```

---

## 5. Caching Strategy

1. **Static Vehicle Master Data:** Vehicle metadata (Make, Model, VIN, Specs) is cached in Redis with a 15-minute TTL.
2. **RAG Knowledge Base:** Diagnostic trouble code definitions and OEM service bulletins are pre-indexed in memory and refreshed on schema migration.
3. **Data Freshness Invariant:** Live telemetry metrics (Speed, Battery SOC, Diagnostic Alerts) are **never cached** to ensure operators make dispatch decisions based solely on authoritative real-time state.
