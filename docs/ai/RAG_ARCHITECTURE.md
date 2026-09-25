# VEHYRON — Retrieval-Augmented Generation (RAG) Architecture

**Document Version:** 1.0.0-PROD  
**Specification:** Grounded OEM Knowledge Ingestion, Indexing, and Context Synthesis

---

## 1. The True Purpose of RAG in VEHYRON

Retrieval-Augmented Generation in VEHYRON exists to eliminate hallucinations when operators query diagnostic trouble codes, vehicle maintenance policies, or OEM telematics specs.

RAG is **not an AI model**; it is an authoritative retrieval pipeline that fetches curated engineering documentation and injects it into the reasoning context before an answer is formulated.

---

## 2. Ingested Knowledge Corpus

| Knowledge Domain | Ingested Documents / Artifacts | Retrieval Purpose |
| :--- | :--- | :--- |
| **Diagnostic Trouble Codes (DTC)** | Standardized OBD-II and OEM-specific DTC definitions (e.g., `P0A80`, `P0300`, `P0128`). | Explaining fault code severity, affected powertrain components, and driving hazards. |
| **OEM Technical Bulletins** | Service bulletins for Toyota Hybrid Synergy Drive, Ford EcoBoost, BMW eDrive, Tesla HV BMS. | Grounding maintenance recommendations in manufacturer-approved procedures. |
| **Fleet Operational Policies** | Maximum continuous driving hours, battery minimum SOC dispatch limits (15%), tire pressure tolerances. | Enforcing company-specific operational thresholds in AI Copilot responses. |

---

## 3. Retrieval Pipeline & Context Construction

```
[ Operator Prompt: "What is DTC P0A80 on Toyota HV?" ]
                        │
                        ▼
[ Token Extraction & Intent Classification ]
                        │
                        ▼
[ Targeted Knowledge Base Lookup (InMemoryKnowledgeBase / pgvector) ]
  Filter: { oem: "TOYOTA", dtc: "P0A80", category: "HYBRID_BATTERY" }
                        │
                        ▼
[ Grounded Context Assembly ]
  Snippet: "Toyota Spec v2.1: DTC P0A80 indicates Replace Hybrid Battery Pack. Sub-code 123..."
                        │
                        ▼
[ Live Telematics Injection ]
  Vehicle SOC: 18.2%, Pack Temp: 58°C
                        │
                        ▼
[ AI Synthesizer ] ──> Structured Response with OEM Citations & Confidence (0.95)
```

---

## 4. Zero-Hallucination Guardrails & Evidence Attribution

Every grounded response returned by the backend includes an immutable `citations` array:
```json
{
  "role": "ASSISTANT",
  "content": "DTC P0A80 indicates a critical high-voltage battery degradation event...",
  "confidenceScore": "95%",
  "modelTag": "DETERMINISTIC_GROUNDED",
  "ruleTag": "SAFETY_RULE_CRITICAL_BATTERY",
  "citations": [
    "Toyota Telematics Diagnostic Spec v2.1 (Section 4.3 - High Voltage Systems)",
    "VEHYRON Authoritative DTC Registry (P0A80 - Replace Hybrid Battery Pack)"
  ]
}
```
If a query lacks matching RAG documentation or live database assets, the system explicitly states that insufficient telemetry data exists, preventing synthetic fabrication of technical advice.
