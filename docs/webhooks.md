# VEHYRON Webhook Ingestion Gateway

## Overview
VEHYRON exposes dedicated, secured webhook ingestion endpoints allowing external telematics devices, hardware dongles, and third-party SaaS dispatch systems to push telemetry directly to VEHYRON.

## Endpoint Contract
```http
POST /api/v1/ingestion/webhooks/{sourceId}
Content-Type: application/json
X-Vehyron-Signature: sha256={hmac_signature}
```

### Path Parameters
- `sourceId`: The registered connector ID (e.g. `toyota-hardware-gw`, `geotab-dispatch-prod`).

### Request Payload Example
```json
{
  "unit_id": "VH-3001",
  "vin": "1HGCR2F83HA009876",
  "oem": "Toyota",
  "battery": 11.4,
  "oil_life": 5,
  "tire_pressure": 28.0,
  "mileage": 64200.0,
  "timestamp": "2026-09-25T21:45:00Z"
}
```

### Response
```json
{
  "sourceId": "toyota-hardware-gw",
  "status": "PROCESSED",
  "receivedRecords": 1,
  "processedRecords": 1,
  "timestamp": "2026-09-25T21:45:01Z"
}
```

## Security & Verification
1. **HMAC Signature**: Validates payload integrity using shared secret stored in the connector's vault reference.
2. **Replay Protection**: Enforces timestamp tolerance (within ±300 seconds of server clock).
3. **Payload Sanitization**: Maximum request body size capped at 10MB; macro execution strictly disabled.
