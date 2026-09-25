# VEHYRON — Known Technical Limitations & Architecture Roadmap

**Document Version:** 1.0.0-PROD  
**Classification:** Technical Risk & Roadmap Disclosure  
**Audience:** Technical Leadership, Handover Recipients

---

## 1. Current Architectural Limitations & Reality Status

To guarantee transparent handover, the following technical boundaries are explicitly identified:

### 1. AI Inference Provider (JEV / External LLMs)
- **Status:** `DETERMINISTIC FALLBACK ACTIVE`
- **Limitation:** Real third-party cloud LLM inference through JEV / TypeSpace cannot be verified locally because no valid enterprise API credentials are configured. The system operates via `DeterministicGroundedProvider` with live database grounding and in-memory RAG.
- **Roadmap Item:** Company must provision an enterprise LLM key and set `fleetiq.jev.enabled=true`.

### 2. Distributed Rate Limiting & SSE Cluster State
- **Status:** `SINGLE-NODE IN-MEMORY`
- **Limitation:** The current `RateLimitingFilter` and `SseEmitter` registry store token buckets and emitter connections in JVM memory. Horizontal scaling across multiple API replicas behind a round-robin load balancer requires Redis for shared rate limits and Redis Pub/Sub for cross-pod SSE broadcast.
- **Roadmap Item:** Deploy Redis cluster and enable `fleetiq.clustering.redis-enabled=true`.

### 3. Password Reset Workflow
- **Status:** `ADMINISTRATIVE RESET IMPLEMENTED`
- **Limitation:** Self-service "Forgot Password" email flows are not yet wired to an external SMTP / SES provider. Administrators reset user passwords via `/api/v1/admin/users`.
- **Roadmap Item:** Integrate AWS SES or SendGrid with time-limited JWT reset tokens.

---

## 2. Component Implementation State Matrix

| Feature / Domain | Architectural State | Verification Level | Production Readiness |
| :--- | :---: | :---: | :---: |
| **Multi-OEM Normalization** | IMPLEMENTED | Verified (Unit + Integration Tests) | **PRODUCTION READY** |
| **Deterministic Decision Engine** | IMPLEMENTED | Verified (Unit + Concurrency Tests) | **PRODUCTION READY** |
| **JWT Authentication** | IMPLEMENTED | Verified (Token Tests + RBAC Tests) | **PRODUCTION READY** |
| **Admin User Management** | IMPLEMENTED | Verified (5/5 Passing Tests) | **PRODUCTION READY** |
| **Immutable Audit Logging** | IMPLEMENTED | Verified (Database Tests) | **PRODUCTION READY** |
| **Rate Limiting Filter** | IMPLEMENTED | Verified (4/4 Passing Tests) | **PRODUCTION READY (Single-Node)** |
| **Flyway Schema Migrations** | IMPLEMENTED | Verified (V1 & V2 Migrations) | **PRODUCTION READY** |
| **Full-Page AI Copilot UI** | IMPLEMENTED | Verified (Vite Production Build) | **PRODUCTION READY** |
| **External JEV Cloud LLM** | FALLBACK READY | Unverified Locally (No API Key) | **REQUIRES COMPANY KEY** |
| **Distributed Redis Cluster** | ARCHITECTED | Documented in `SCALABILITY.md` | **POST-HANDOVER ENHANCEMENT** |
