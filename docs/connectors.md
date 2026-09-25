# VEHYRON — Supported Data Source Connectors

VEHYRON provides pluggable `DataSourceConnector` adapters for enterprise telemetry integration.

## Supported Connector Matrix

| Connector Type | Protocol / Library | Delivery Mode | Common Use Case |
|---|---|---|---|
| **Apache Kafka** | Apache Kafka Client | Real-time Streaming | High-throughput connected vehicle streaming platforms |
| **MQTT / IoT** | Eclipse Paho / MQTT v3/v5 | Event-driven Pub/Sub | Connected telematics dongles, OBD-II devices |
| **REST Poller** | Spring WebClient / HttpClient | Polling Interval | Pulling updates from OEM developer APIs (BMW, Toyota, Tesla) |
| **Webhooks** | HTTP POST Ingestion | Push Notification | Telematics hardware gateways & 3rd-party SaaS dispatch |
| **Google Cloud Pub/Sub** | GCP Pub/Sub Client | Serverless Stream | Cloud-native fleet infrastructures hosted on GCP |
| **AWS Kinesis** | AWS SDK Kinesis Client | Sharded Event Stream | AWS-hosted connected car pipelines |
| **Azure Event Hubs** | Azure Messaging Event Hubs | AMQP / Kafka Surface | Microsoft Azure enterprise mobility workloads |
| **Excel / CSV Batch** | Apache POI & Commons CSV | Batch Upload | Historical datasets, fleet maintenance imports, manual auditing |

---

## Connector Lifecycle Contract

Every connector implements `com.fleetiq.service.ingestion.DataSourceConnector`:

```java
public interface DataSourceConnector {
    String getType();
    boolean testConnection(DataSource source);
    void start(DataSource source);
    void stop(DataSource source);
    boolean isRunning(DataSource source);
    String inspectSchema(DataSource source);
}
```

### Security & Secret Storage
- Plaintext secrets and API tokens are **never** stored in database tables or exposed in JSON responses.
- All credentials reference backend vault identifiers (`credentialReference`), e.g. `VAULT_KAFKA_SECRET_PROD`.
- Frontend displays masked placeholders: `••••••••••••ABCD`.
