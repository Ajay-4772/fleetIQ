# Apache Kafka Ingestion Connector

## Overview
The VEHYRON Apache Kafka connector allows enterprise vehicle operators to ingest telemetry events from internal Kafka topics (e.g. `vehyron.telemetry.events`) directly into the normalization engine.

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `brokerUrl` | String | Yes | Kafka Bootstrap Servers (e.g., `kafka.telematics.internal:9092`) |
| `topic` | String | Yes | Telemetry event topic name |
| `consumerGroup` | String | Yes | Consumer group ID (e.g., `vehyron-ingestion-workers`) |
| `credentialReference` | String | No | Vault secret pointer for SASL/SCRAM or SSL certificates |
| `securityProtocol` | String | No | `PLAINTEXT`, `SSL`, `SASL_PLAINTEXT`, `SASL_SSL` |
| `offsetReset` | String | No | `latest` (default) or `earliest` |

## Payload Example
```json
{
  "unit_id": "VH-1029",
  "vin": "1HGCR2F83HA001234",
  "battery_voltage": 11.2,
  "oil_life": 12,
  "tire_pressure": 29.5,
  "mileage": 48210.5,
  "timestamp": "2026-09-25T21:40:00Z"
}
```

## Admin UI Setup
1. Navigate to **Data Ingestion** (`/admin/ingestion`).
2. Click **Connect Data Source** -> Select **Apache Kafka**.
3. Enter Bootstrap Servers and Topic name.
4. Click **Test Handshake** to confirm broker connectivity.
5. Review detected schema and click **Activate & Start Ingestion**.
