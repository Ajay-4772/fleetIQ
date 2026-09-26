# VEHYRON — Operations & Site Reliability Engineering Guide

**Document Version:** 1.0.0-PROD  
**Classification:** SRE Operational Guide  
**Audience:** 24/7 Operations Center, SRE Teams

---

## 1. Health Checks & Readiness Probes

VEHYRON exposes Spring Boot Actuator endpoints for container orchestrators and synthetic uptime monitors:
- **`GET /actuator/health`:** Overall system health.
- **`GET /actuator/health/liveness`:** Verifies JVM process is responsive; failure triggers container restart.
- **`GET /actuator/health/readiness`:** Verifies PostgreSQL database connectivity and Flyway migration state; failure removes pod from load balancer routing.

*Note: Actuator sensitive endpoints (`/env`, `/heapdump`) are disabled in production to protect credentials.*

---

## 2. Key Operational Metrics (Prometheus)

Exposed at `/actuator/prometheus` for scraping:
1. `http_server_requests_seconds_count`: Total request throughput per route.
2. `http_server_requests_seconds_max`: Maximum endpoint latency.
3. `vehyron_telemetry_ingest_total`: Ingested telematics event count partitioned by OEM tag (`toyota`, `ford`, `bmw`, `tesla`).
4. `vehyron_decision_actions_created_total`: Priority action orders generated.
5. `vehyron_rate_limit_exceeded_total`: Throttled requests (HTTP 429).
6. `hikaricp_connections_active`: Active PostgreSQL database connection count.

---

## 3. Log Aggregation & Structured Context

All log statements conform to structured JSON logging:
```json
{
  "timestamp": "2026-09-25T14:45:00.123Z",
  "level": "INFO",
  "thread": "http-nio-8080-exec-4",
  "logger": "com.vehyron.service.telemetry.TelemetryIngestionService",
  "message": "Normalized telematics event processed",
  "vehicleId": "VH-TOY-101",
  "oem": "TOYOTA",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```
In Splunk / Datadog / CloudWatch, filter on `correlationId` to trace a request across security filters, normalization, decision processing, and database persistence.
