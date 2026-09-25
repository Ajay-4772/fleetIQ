# ADR-008: Distributed Tracing with OpenTelemetry

## Status
**ACCEPTED** (Implemented and Verified)

## Context
When a vehicle emits an out-of-band telemetry anomaly, the request traverses ingestion filters, normalization adapters, database queries, AI decision clients, and SSE emitters. Debugging performance bottlenecks or intermittent AI timeouts requires unified trace visibility across these boundaries.

## Decision
1. Add `io.micrometer:micrometer-tracing-bridge-otel` to `backend/pom.xml`.
2. Configure Spring Boot Actuator tracing with 100% sampling probability and W3C / B3 propagation types in `application.yml`.
3. Configure SLF4J / Logback pattern to automatically include `[%X{traceId:-},%X{spanId:-}]` in every log statement.
4. Implement `TraceResponseFilter` attached at high precedence to ensure every HTTP response returns an `X-Trace-Id` header, respecting incoming W3C `traceparent` headers.
5. Extend `DashboardEventDto` with `traceId` and correlate `SseEmitterService` broadcast events with active trace contexts.
6. Expose `X-Trace-Id` and allow `traceparent`, `tracestate` in CORS configuration (`SecurityConfig.java`).

## Consequences
### Positive
- End-to-end distributed latency breakdown from ingestion to operator dashboard.
- Operators and frontend clients can trace any error or event to exact server logs using `X-Trace-Id`.
- Seamless W3C Trace Context standard compliance across microservices and external gateways.
### Negative / Trade-offs
- Minor CPU and memory overhead for tracer context creation.
