# FleetIQ — Retrieval-Augmented Generation (RAG) Architecture

## 1. Purpose of RAG in FleetIQ
In FleetIQ, the RAG layer is strictly dedicated to **technical knowledge retrieval**. It provides domain context that cannot be derived solely from relational telemetry records:
- Standard Diagnostic Trouble Code (DTC) explanations (SAE J2012 standards).
- OEM telemetry schema documentation (Toyota, Ford, BMW, Tesla).
- Thresholds and calculation formulas used by the rule engine.
- Operational SOPs (Standard Operating Procedures) for fleet maintenance dispatch.
- Domain terminology glossary.

---

## 2. Ingestion & Indexing Pipeline

```
Markdown Documents (src/main/resources/knowledge/*.md)
  ├── fault-codes.md (P0300, P0171, P0562, P0217, C0035, U0100...)
  ├── oem-normalization.md (Toyota, Ford, BMW, Tesla field mapping)
  ├── decision-rules.md (Severity tiers, confidence, human review criteria)
  ├── architecture.md (Pipeline, ingestion, persistence, SSE broadcast)
  └── glossary.md (DTC, CAN bus, SOC, SOH, Telematics, Telemetry)
                        │
                        ▼
               DocumentLoader & Chunking
    (Splits docs by markdown headers and paragraphs into chunks)
                        │
                        ▼
                Embedding / Indexer
        (RagIndexer.java: 25 indexed chunks)
                        │
                        ▼
                   VectorStore
   (Local In-Memory Cosine Similarity / Optional PostgreSQL pgvector)
                        │
                        ▼
                    Retriever
   (Ranked top-k technical context retrieved for AI Assistant)
```

---

## 3. Privacy & Safety Controls

To adhere strictly to licensing and privacy guidelines:
1. **No Confidential Data in RAG**: Private personal information, customer proprietary fleet metrics, passwords, and external API keys are **never** indexed into RAG.
2. **Open-Standard Knowledge Only**: Knowledge documents are derived exclusively from public automotive standards (OBD-II, SAE J1939, SAE J2012) and synthetic FleetIQ architecture documentation.
3. **Pluggable Vector Storage**: FleetIQ includes a zero-dependency lexical/semantic in-memory retriever by default, with an optional native PostgreSQL `pgvector` migration profile for production scale.
