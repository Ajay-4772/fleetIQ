# VEHYRON — Observability & Telemetry

**Framework**: Spring Boot Actuator, Micrometer Tracing, OpenTelemetry, SLF4J / Logback  
**Health Check Endpoints**: `/actuator/health`, `/actuator/info`, `/actuator/metrics`  
**Tracing Specification**: W3C Trace Context (`traceparent`, `tracestate`) & `X-Trace-Id` Response Header

---

## 1. Structured Logging & MDC Trace Correlation
- **Format**: SLF4J parameterized logging with contextual markers.
- **Logback Pattern**:
  `%5p [${spring.application.name:vehyron-backend},%X{traceId:-},%X{spanId:-}]`
  Every log statement automatically includes the active OpenTelemetry 128-bit `traceId` and 64-bit `spanId`.
- **Log Levels**:
  - `ERROR`: Unhandled exceptions, failed database transactions, unrecoverable system errors.
  - `WARN`: AI service timeouts triggering deterministic fallback, degraded sensor readings, rejected invalid auth attempts.
  - `INFO`: Lifecycle milestones (server start, seed initialization, batch telemetry completed, action status updated).
  - `DEBUG`: In-depth normalization field mappings, raw payload snippets (disabled in production).
- **Security Invariant**: Never log passwords, raw JWT tokens, API keys, or PII.

---

## 2. Distributed Tracing Architecture (OpenTelemetry)
- **Engine**: `io.micrometer:micrometer-tracing-bridge-otel`
- **Sampling Probability**: `1.0` (100% trace sampling across all incoming requests).
- **Propagation**: W3C Trace Context and B3 supported via `management.tracing.propagation.type: W3C,B3`.
- **HTTP Response Header (`TraceResponseFilter`)**:
  - Every HTTP response returned by VEHYRON automatically includes the header `X-Trace-Id: <traceId>`.
  - When an upstream service or client passes a W3C `traceparent` (e.g., `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`), the backend preserves and propagates the 128-bit trace ID.
- **Real-Time SSE Correlation (`SseEmitterService`)**:
  - Outgoing `DashboardEventDto` telemetry events automatically carry `traceId` and matching `correlationId`, allowing client UIs to correlate live push events with server log traces.
- **CORS Support**:
  - `X-Trace-Id` is exposed via `Access-Control-Expose-Headers`.
  - `traceparent` and `tracestate` are allowed in `Access-Control-Allow-Headers`.

---

## 3. Metrics & Business KPIs
Exposed via Spring Boot Actuator (`/actuator/metrics`):
- **System Metrics**:
  - `jvm.memory.used`, `jvm.threads.live`, `process.cpu.usage`, `hikaricp.connections.active`.
- **Operational & Business Metrics**:
  - Total active vehicles vs grounded vehicles.
  - Action items by priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - Normalization throughput (events processed per second).
  - AI Decision vs Fallback Ratio: Tracking percentage of decisions resolved by `AI_JEV` vs `DETERMINISTIC_RULES`.
  - Fallback trigger frequency: Instant alert if fallback rate exceeds 15% over a 5-minute sliding window.

---

## 4. Health Checks & Alerting Thresholds
- **Liveness**: `/actuator/health/liveness` verifies the Spring application context and JVM responsiveness.
- **Readiness**: `/actuator/health/readiness` verifies database connectivity (Hikari connection pool ping) and disk space availability.
- **Alert Conditions**:
  - Any `CRITICAL` severity vehicle grounding decision.
  - Database connection pool exhaustion (> 90% utilized).
  - Consecutive external AI timeouts (> 5 failures within 60 seconds).
