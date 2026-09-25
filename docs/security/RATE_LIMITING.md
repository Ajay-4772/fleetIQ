# FleetIQ — Rate Limiting & Denial-of-Service Defense

**Document Version:** 1.0.0-PROD  
**Specification:** Ingestion Protection, AI Cost Controls, and API Throttling

---

## 1. Overview & Architectural Motivation

To protect FleetIQ against brute-force authentication attacks, accidental telemetry floods, and excessive external AI inference costs, incoming requests pass through `RateLimitingFilter` prior to controller invocation.

Requests exceeding defined window thresholds receive an **HTTP 429 Too Many Requests** response formatted in compliant `ApiErrorResponse` JSON with a `Retry-After: 60` HTTP header.

---

## 2. Rate Limiting Tiers

| Tier Name | Route Pattern | Request Limit | Window Duration | Architectural Objective |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication Tier** | `/api/v1/auth/**` | **15 requests** | 1 Minute | Prevents credential stuffing, password spray attacks, and brute-force token requests. |
| **AI Copilot Tier** | `/api/v1/assistant/**` | **40 requests** | 1 Minute | Protects LLM inference budgets, token limits, and database RAG vector retrieval pipelines. |
| **Telemetry Ingest Tier** | `/api/v1/telemetry/**` | **300 requests** | 1 Minute | Absorbs bursts of multi-OEM vehicle sensor payloads while capping DoS amplification. |
| **General Platform Tier** | `/api/v1/**` (All other routes)| **600 requests** | 1 Minute | Accommodates frequent dashboard polling, SSE reconnects, and asset filtering. |

---

## 3. Production Deployment Architecture (Redis Token Bucket)

In clustered enterprise deployments across multiple horizontal API instances:
- The in-memory token bucket is replaced with a distributed Redis atomic script (`Redisson` or `Bucket4j-Redis`).
- Rate limits are keyed on a composite identifier: `${clientIp}:${authenticatedUsername}:${routeTier}`.
- Cloudflare WAF or AWS WAF operates as the outer perimeter rate limiter, absorbing network-level SYN/HTTP floods before reaching API containers.
