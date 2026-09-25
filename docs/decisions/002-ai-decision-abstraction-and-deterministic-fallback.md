# ADR-002: AI Decision Abstraction & Deterministic Fallback

## Status
**ACCEPTED** (Verified in codebase)

## Context
Fleet operations require high reliability. Critical vehicle grounding and maintenance prioritization cannot stall or halt if an upstream AI model (cloud LLM or ML microservice) experiences network latency, rate limits, outages, or returns low confidence. Conversely, relying solely on simple if-else statements restricts the system's ability to interpret complex telemetry patterns.

## Decision
1. Encapsulate all decision-making capabilities behind the `DecisionService` interface.
2. Implement `JevDecisionService` to interact with external AI decision services (`api.jev.ai`).
3. Implement `RuleBasedDecisionService` as a pure, local deterministic rule engine based on established automotive diagnostic thresholds (e.g. DTCs `P0A80`, `P0300`, battery SoC < 10%, brake wear < 15%).
4. Coordinate execution via `HybridDecisionService`:
   - If AI service fails, times out (`JEV_TIMEOUT_MS: 3000`), or returns confidence < 0.80, automatically invoke `RuleBasedDecisionService`.
   - Record `decisionSource` (`AI_JEV` vs `DETERMINISTIC_RULES`) in the resulting `Decision` entity for complete transparency.

## Consequences
### Positive
- Zero operational downtime: Fleet dispatchers always receive actionable decisions even in air-gapped or disconnected environments.
- Explainability: Deterministic fallback provides strict auditable rules for compliance and safety investigations.
### Negative / Trade-offs
- Need to maintain dual logic branches (AI prompt/schemas + local deterministic rules).
- Automated regression test suite required to verify fallback triggers under failure scenarios.
