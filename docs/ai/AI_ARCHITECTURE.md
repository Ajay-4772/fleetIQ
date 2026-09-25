# VEHYRON — AI Architecture, Model Abstraction & Decision Safety

**Document Version:** 1.0.0-PROD  
**Specification:** Hybrid Decision Engine, Provider Abstraction, and Factual Model Audit

---

## 1. Executive Summary & Core Principle

VEHYRON enforces a **Hybrid Telematics Decision Architecture**. Under no circumstances is an AI Large Language Model permitted to operate as an unchecked or sole source of truth for safety-critical vehicle dispatch, braking alarms, or battery thermal interventions.

### Authoritative Processing Pipeline
```
[ Raw Multi-OEM Telematics Event ]
                │
                ▼
[ Strict Schema Validation (DTOs) ]
                │
                ▼
[ Canonical Normalization (Toyota / Ford / BMW / Tesla) ]
                │
                ▼
[ Authoritative Deterministic Rule Engine ] ──> Evaluates Safety Invariants (Battery Temp, DTCs)
                │
                ▼
[ Live Context & Feature Extraction ]       ──> State of Charge, Speed, Diagnostic History
                │
                ▼
[ RAG Knowledge Base Retrieval ]            ──> OEM Service Manuals, DTC Definitions
                │
                ▼
[ AI Model Provider Abstraction ]           ──> Synthesizes Reasoning & Contextual Summary
                │
                ▼
[ Structured Output & Safety Guardrails ]   ──> Validates JSON Schema, Confidence Bounds
                │
                ▼
[ Human Operator Dispatch Decision ]        ──> Action Queue with Override & Audit Trail
```

---

## 2. Factual Audit: JEV & TypeSpace Reality

In adherence with strict anti-fabrication standards, the VEHYRON codebase has been audited line-by-line:

| Provider / Claim | Audit Findings & Code Evidence | Runtime Status |
| :--- | :--- | :--- |
| **TypeSpace AI (`typespace.ai`)** | 0 references exist in `backend/` or `frontend/`. Not implemented. | **MISSING / NON-EXISTENT** |
| **JEV AI (`JevDecisionService`)** | Exists in `com.fleetiq.service.decision.JevDecisionService`. Property `fleetiq.jev.enabled` defaults to `false`. No valid external API key is provided in source or development configuration. | **DETERMINISTIC FALLBACK ACTIVE** |
| **Inference Reality** | Because no valid JEV API credential exists, the system automatically falls back to `RuleBasedDecisionService`. Real external JEV inference cannot be verified locally without company credentials. | **UNVERIFIED LOCALLY / FALLBACK** |

---

## 3. AI Provider Abstraction Interface

To prevent vendor lock-in, all AI operations depend upon the `AIModelProvider` contract:

```java
package com.fleetiq.service.ai;

public interface AIModelProvider {
    String getProviderName();
    boolean isAvailable();
    AssistantResponse generateResponse(String prompt, String context, List<String> ragSources);
}
```

### Active Provider Implementations
1. **`DeterministicGroundedProvider` (Active Default):**
   - Evaluates incoming prompt against regex-driven intent extractors.
   - Queries live PostgreSQL database for real-time asset metrics.
   - Retrieves grounded OEM documentation snippets.
   - Emits structured `AssistantResponse` with `confidence = 0.95`, `modelTag = "DETERMINISTIC_GROUNDED"`, and OEM citations.
2. **`JevAIProvider` (Enterprise Optional):**
   - Pluggable HTTP client targeting external JEV / OpenAI / Claude API endpoints when configured with valid company credentials.
   - Protected by 5,000ms circuit breaker timeout and automatic fallback to `DeterministicGroundedProvider`.
