# VEHYRON — Data Ingestion & Gateway Architecture

## 1. Overview
VEHYRON (Connected Vehicle Intelligence Platform) is architected around an asynchronous, multi-channel data ingestion gateway designed to connect external enterprise telematics infrastructure directly to real-time normalization and intelligence pipelines.

```
External IoT / OEM Sources (Kafka, MQTT, REST, Webhooks, Cloud Streams, Excel/CSV)
                                   │
                                   ▼
                   VEHYRON Data Source Connectors
                                   │
                                   ▼
                            Raw Storage Layer
                    (Auditability & Forensic Replay)
                                   │
                                   ▼
                      Schema & Physical Validation
                     (Range, Timestamp, VIN Checks)
                                   │
                                   ▼
                       Multi-OEM Normalization
                     (Toyota, BMW, Tesla, Ford)
                                   │
                                   ▼
                     Vehicle Intelligence Engine
                  (Issue Detection, Priority, Actions)
                                   │
                                   ▼
                         Module Event Routing
       ┌─────────────────┬──────────────────┬─────────────────┐
       ▼                 ▼                  ▼                 ▼
Fleet Registry    Live Telemetry      Diagnostics      Priority Actions
       │                 │                  │                 │
       └─────────────────┴────────┬─────────┴─────────────────┘
                                  ▼
                         Real-Time Push (SSE)
                                  │
                                  ▼
                       VEHYRON Operations UI
```

---

## 2. Ingestion Principles

### A. Zero Synthetic Data
VEHYRON does not generate or rely on hardcoded demo vehicles. An empty database containing zero records is a first-class supported state. Operational tables are strictly hydrated from incoming data streams.

### B. Raw Payload Preservation
Before applying destructive transformations or normalization, VEHYRON logs the raw payload with its source identifier, correlation ID, and ingestion timestamp into `raw_vehicle_records`. This enables forensic auditing and dead-letter replay.

### C. Idempotency & Deduplication
Every incoming event is evaluated against a composite hash of `(source, externalEventId, vehicleId, timestamp)`. Repeated transmissions are safely deduplicated to prevent phantom vehicle issues or erroneous operational costs.

### D. Data Freshness Tracking
VEHYRON distinguishes between data origin and freshness:
- **`LIVE`**: Streamed within the last 60 seconds from an active connector.
- **`WEBHOOK`**: Event received via hardware gateway webhook push.
- **`STREAM`**: Ingested via message broker (Kafka, Pub/Sub, Kinesis).
- **`IMPORTED`**: Ingested via batch Excel or CSV dataset.
- **`STALE`**: No updates received within the expected SLA.
- **`OFFLINE`**: Gateway connection severed.

---

## 3. Endpoints & Security
All administrative ingestion management endpoints require `ROLE_ADMIN` authorization:
- `GET /api/v1/ingestion/sources`: List configured connectors.
- `POST /api/v1/ingestion/sources`: Register new data connector.
- `POST /api/v1/ingestion/sources/{id}/test`: Test broker handshake.
- `POST /api/v1/ingestion/sources/{id}/start`: Start consumer/poller.
- `POST /api/v1/ingestion/sources/{id}/stop`: Pause consumer/poller.
- `POST /api/v1/ingestion/upload/preview`: Inspect column schema and preview records.
- `POST /api/v1/ingestion/upload`: Execute batch dataset import.
- `POST /api/v1/ingestion/retry/{recordId}`: Replay failed raw record.
- `POST /api/v1/ingestion/webhooks/{sourceId}`: Authenticated webhook receiver (supports hardware signature validation).
