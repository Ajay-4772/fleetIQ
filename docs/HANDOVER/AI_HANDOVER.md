# VEHYRON — AI & Intelligence Copilot Handover

**Document Version:** 1.0.0-PROD  
**Classification:** AI Architecture & Model Operations  
**Audience:** AI Engineers, Machine Learning Leads

---

## 1. AI Decision Architecture & Safety Invariants

VEHYRON integrates AI as a decision support layer, not an autonomous authority for safety-critical fleet operations.

### Deterministic Safety Primacy
- If high-voltage battery cell temperature exceeds 55°C, or a critical brake sensor error occurs (`P0A80`, `C1201`), the **deterministic rule engine** instantly generates a `CRITICAL` priority action.
- The AI Copilot explains the fault and cites manufacturer service bulletins; it cannot downgrade or cancel the critical action without human operator approval.

---

## 2. Factual Audit of External Models (JEV & TypeSpace)

- **TypeSpace (`typespace.ai`):** Completely absent from the codebase. No dependencies, SDKs, or API calls exist.
- **JEV (`JevDecisionService`):** Implemented with a configuration toggle `fleetiq.jev.enabled=false`. No valid external API key is stored. At runtime, the service defaults safely to `RuleBasedDecisionService`.
- **Verdict for Handover:** Real third-party cloud LLM inference is currently unverified locally. The company must provide an enterprise LLM API key (OpenAI, Anthropic Claude, or JEV) and set `AI_PROVIDER=jev` to activate external cloud models.

---

## 3. Switching or Upgrading AI Providers

To connect a new model provider (e.g. Anthropic Claude, OpenAI, or local vLLM):
1. Implement the `AIModelProvider` interface in `com.fleetiq.service.ai`:
   ```java
   @Component
   @ConditionalOnProperty(name = "fleetiq.ai.provider", havingValue = "custom-llm")
   public class CustomLlmProvider implements AIModelProvider { ... }
   ```
2. Configure environment variables in production:
   ```bash
   FLEETIQ_AI_PROVIDER=custom-llm
   CUSTOM_LLM_API_KEY=sk-prod-...
   CUSTOM_LLM_ENDPOINT=https://api.company.internal/v1/chat/completions
   ```
3. The Copilot UI, conversation persistence, and RAG retrieval pipelines will immediately route through your new provider without changes to the frontend or database schemas.
