# VEHYRON — Observability, Metrics & Monitoring Handover

**Document Version:** 1.0.0-PROD  
**Classification:** Monitoring & Metrics Reference  
**Audience:** Site Reliability Engineers, DevOps Leads

---

## 1. Observability Triad (Metrics, Logs, Traces)

VEHYRON is observable across the entire request and telemetry lifecycle:
- **Metrics:** Scraped via Prometheus endpoint `/actuator/prometheus`.
- **Logs:** Structured JSON with correlation IDs, logged to `stdout` for container log shippers (FluentBit / Datadog Agent).
- **Traces:** Distributed tracing via OpenTelemetry correlation headers (`traceparent` and `X-Correlation-ID`).

---

## 2. Critical Alerting Rules (Prometheus Alertmanager)

```yaml
groups:
  - name: fleetiq-production-alerts
    rules:
      - alert: VEHYRONHighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m]) > 0.02
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "VEHYRON HTTP 5xx error rate exceeds 2% over 5 minutes."

      - alert: VEHYRONDatabaseConnectionPoolSaturation
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.85
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "HikariCP connection pool usage exceeds 85% capacity."

      - alert: VEHYRONRateLimitSpike
        expr: rate(http_server_requests_seconds_count{status="429"}[5m]) > 50
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Abnormal surge in HTTP 429 rate-limited requests detected."
```
