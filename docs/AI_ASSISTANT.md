# FleetIQ — Grounded AI Assistant Specification

## 1. Grounded AI Mental Model

```
                    USER QUESTION
                          │
                          ▼
            [Query Classification Router]
            ┌─────────────┴─────────────┐
            ▼                           ▼
    LIVE FLEET DATA               TECHNICAL KNOWLEDGE
(PostgreSQL / JPA Repos)                 (RAG)
  - Vehicle counts              - Fault-code definitions (DTC)
  - Critical actions            - OEM normalization specs
  - Battery / Oil stats         - Decision rules & thresholds
  - Open work orders            - System architecture & glossary
            └─────────────┬─────────────┘
                          ▼
                 HYBRID REASONING ENGINE
        (Deterministic Rule Engine + Optional LLM)
                          │
                          ▼
             GROUNDED OPERATIONAL RESPONSE
      - Factual answer with exact metrics
      - Supporting live fleet data
      - Recommended operator dispatch action
      - Source citations (LIVE_DATA vs KNOWLEDGE_RAG)
```

---

## 2. Live Operational Data vs. Knowledge Retrieval (RAG)

### The Cardinal Rule
> **RAG is never used to answer fleet counts, active faults, or vehicle statuses.**

| Question Type | Target Source | Routing Mechanism |
|---|---|---|
| *"How many critical vehicles are there?"* | **PostgreSQL Database** | Direct JPA Repository aggregation query. |
| *"What does P0300 mean?"* | **Knowledge Base (RAG)** | Chunks retrieved from `fault-codes.md`. |
| *"Which vehicles have P0300 and what should operators do?"* | **Live DB + RAG + Reasoning** | Queries DB for vehicles with DTC P0300, retrieves P0300 definition from RAG, combines into grounded operator dispatch recommendation. |
| *"Show vehicles with battery health below 70%"* | **PostgreSQL Database** | Deterministic parameterized query on `VehicleRepository`. |
| *"Why is VH-1001 high priority?"* | **Live DB + Rules** | Decision audit trail from `DecisionRepository` and `ActionItemRepository`. |

---

## 3. Query Intent Routing & Safety
To guarantee safety and prevent SQL injection or hallucinations:
1. The assistant classifies user intent into predefined enums:
   - `FLEET_COUNT_CRITICAL`
   - `MAINTENANCE_DUE`
   - `HIGH_RISK_ASSETS`
   - `VEHICLE_HEALTH_CHECK`
   - `BATTERY_HEALTH_EV`
   - `DTC_EXPLANATION`
   - `HUMAN_REVIEW_ACTIONS`
2. Java maps each intent to a strictly parameterized JPA query or service method.
3. The AI assistant is **never given arbitrary SQL execution authority**.

---

## 4. Offline Fallback & Provider Decoupling
FleetIQ is designed to operate seamlessly without third-party AI dependencies:
- **With External AI**: When Jev / Gemini credentials are present, the assistant leverages LLM reasoning to synthesize natural language summaries.
- **Without External AI**: When credentials are missing or the provider fails, `AiAssistantService` uses deterministic rule-based templates. The system returns 100% accurate, factual answers backed by live database data and RAG documentation with zero downtime.
