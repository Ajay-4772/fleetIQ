# FleetIQ — Testing Strategy & Quality Assurance

**Target Frameworks**: JUnit 5, Mockito 5, Spring Boot Starter Test, Spring Security Test  
**Active Test Suite**: 8 Test Classes, 42 Tests, 100% Pass Rate  
**Status**: Verified & Enforced

---

## 1. Testing Pyramid Overview

```
             ┌─────────────────────────┐
             │   Full E2E / Browser    │  (Smoke & Visual Verification)
             ├─────────────────────────┤
             │ Integration & API Tests │  (MockMvc, Controller + Security)
             ├─────────────────────────┤
             │ Service & Fallback Path │  (AI Failure, Normalization, Detection)
             ├─────────────────────────┤
             │   Pure Unit Tests       │  (DTOs, Rules, Mathematical Models)
             └─────────────────────────┘
```

---

## 2. Test Class Taxonomy

| Test Suite | Scope | Key Invariants Verified |
| :--- | :--- | :--- |
| **`NormalizationTests`** | Service / Normalization | Correct mapping from Tesla, Ford, BMW, Toyota JSON to `CanonicalVehicleEvent`. Unit conversion (speed, SoC, odometer) accuracy. |
| **`DecisionAndAiFallbackTests`** | Service / AI Abstraction | **MANDATORY**: JEV AI timeout, HTTP 500, or invalid payload immediately triggers `RuleBasedDecisionService`. Confidence threshold < 0.80 failover. |
| **`DetectionAndImpactTests`** | Service / Analytics | Diagnostic trouble code identification, anomaly detection thresholds, maintenance cost estimation, and downtime calculation. |
| **`AiAssistantAndRagTests`** | Service / RAG | Knowledge base chunk indexing, document relevance retrieval, entity query grounding, refusal of ungrounded prompts. |
| **`FleetQueryAndActionTests`** | Service / Queries | Intent parsing (e.g., "grounded vehicles", "battery low"), action creation, priority score weighting. |
| **`SecurityAndAuthTests`** | Security / Auth | Valid/expired JWT token evaluation, role-based endpoint authorization (`ROLE_ADMIN`, `ROLE_DISPATCHER`), invalid ingestion API key rejection. |
| **`IntegrationAndApiTests`** | Controller / Integration | Full MockMvc execution of `/api/v1/dashboard/summary`, `/api/v1/actions`, `/api/v1/simulator/generate` with security context. |
| **`ExportAndSearchTests`** | Controller / Export | CSV/JSON data export endpoints, vehicle search filters, pagination. |
| **`DistributedTracingTests`** | Observability / Tracing | OpenTelemetry Tracer bean availability, `X-Trace-Id` response header injection, W3C `traceparent` propagation, and SSE broadcast trace correlation. |

---

## 3. Mandatory Testing Rules for New Changes

### 3.1 AI Decision Engine Fallback Testing
Every modification to `DecisionService`, `JevDecisionService`, or `RuleBasedDecisionService` must provide tests proving:
1. When AI responds normally: Recommended action is applied with `decisionSource = AI_JEV`.
2. When AI throws an exception / timeout: Fallback succeeds with `decisionSource = DETERMINISTIC_RULES`.
3. When AI reports confidence < 0.80: Fallback succeeds with `decisionSource = DETERMINISTIC_RULES`.

### 3.2 Failure-Path & Edge Case Testing
- Test null, missing, or malformed JSON fields in OEM payloads.
- Test out-of-range sensor readings (e.g. speed > 300 km/h, negative odometer).
- Test duplicate event ingestion (idempotency check).

### 3.3 Execution Commands
```bash
# Run complete test suite:
mvn test -f backend/pom.xml

# Run specific test suite:
mvn test -f backend/pom.xml -Dtest=DecisionAndAiFallbackTests

# Verify compilation and frontend build:
mvn package -DskipTests -f backend/pom.xml && npm run build --prefix frontend
```
