# ADR-005: Grounded Hybrid RAG Assistant

## Status
**ACCEPTED** (Verified in codebase)

## Context
Fleet dispatchers query operational procedures, diagnostic codes, and live fleet status via natural language. General-purpose LLMs without domain grounding hallucinate incorrect torque specs, wrong DTC definitions, or non-existent vehicle states.

## Decision
1. Implement a hybrid RAG architecture (`RagService` & `RagIndexer`):
   - Index local curated technical documentation chunks (`resources/knowledge/*.md`).
   - Query live vehicle entities directly from `VehicleRepository` and `ActionItemRepository`.
2. Synthesize answers by injecting both relevant documentation passages and real-time database state into the LLM prompt.
3. If no matching documentation or vehicles exist, return a strict deterministic fall-through response rather than fabricating answers.

## Consequences
### Positive
- Strict factual accuracy: All answers cite verified technical manuals or live database records.
- Zero external vector database overhead for baseline operations.
### Negative / Trade-offs
- Chunk search relies on in-memory BM25/keyword ranking; scaling to hundreds of thousands of manuals will require an external vector search engine.
