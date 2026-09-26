# VEHYRON — External Telematics Integration Guide

## 1. Overview
External telemetry producers (OEM cloud gateways, Geotab/Samsara telematics webhooks, or IoT devices) can stream events directly into VEHYRON via the Ingestion API.

---

## 2. Ingestion Endpoint Specification

### Endpoint
```http
POST /api/v1/events/ingest
```

### Headers
```http
Content-Type: application/json
X-API-Key: vehyron-ingest-secure-key-2026
```
*(Or `Authorization: Bearer <jwt_token>` for human operations leads)*

---

## 3. Telemetry Payload Contracts

### A. Toyota Telematics Payload Example
```json
{
  "source": "SIMULATED_TOYOTA",
  "eventId": "EV-TOYOTA-2026-001",
  "vehicleId": "VH-1001",
  "timestamp": "2026-09-25T08:00:00Z",
  "idempotencyKey": "IDEM-TOYOTA-2026-001",
  "correlationId": "CORR-PROD-TOYOTA-001",
  "payload": {
    "vehicle_id": "VH-1001",
    "oil_life": 8.5,
    "odometer": 45200,
    "battery_pct": 78.0,
    "fault": "P0300",
    "idle_minutes": 45
  }
}
```

### B. Ford Commercial Solutions Telematics Payload Example
```json
{
  "source": "SIMULATED_FORD",
  "eventId": "EV-FORD-2026-001",
  "vehicleId": "VH-1002",
  "timestamp": "2026-09-25T08:00:00Z",
  "idempotencyKey": "IDEM-FORD-2026-001",
  "correlationId": "CORR-PROD-FORD-001",
  "payload": {
    "vehicleIdentifier": "VH-1002",
    "oilLifePercentage": 4.2,
    "idleDuration": 120,
    "diagnosticCode": "P0524",
    "batteryState": 82.0,
    "mileage": 68400
  }
}
```

### C. BMW ConnectedDrive Telematics Payload Example
```json
{
  "source": "SIMULATED_BMW",
  "eventId": "EV-BMW-2026-001",
  "vehicleId": "VH-1004",
  "timestamp": "2026-09-25T08:00:00Z",
  "idempotencyKey": "IDEM-BMW-2026-001",
  "correlationId": "CORR-PROD-BMW-001",
  "payload": {
    "vehicleIdentifier": "VH-1004",
    "oil_life_remaining": 35.0,
    "idlingTimeMinutes": 15,
    "dtc": "P0171",
    "batteryHealth": 91.0,
    "totalDistanceKm": 31200
  }
}
```

### D. Generic Canonical Vehicle Event Example
```json
{
  "source": "CANONICAL",
  "eventId": "EV-CANONICAL-2026-001",
  "vehicleId": "VH-1060",
  "timestamp": "2026-09-25T08:00:00Z",
  "idempotencyKey": "IDEM-CANONICAL-2026-001",
  "correlationId": "CORR-PROD-CANONICAL-001",
  "payload": {
    "vehicleId": "VH-1060",
    "eventType": "BATTERY_WARNING",
    "severity": "CRITICAL",
    "faultCode": "P0A80",
    "batteryHealthPct": 42.0,
    "oilLifePct": 85.0,
    "odometerKm": 98400
  }
}
```

---

## 4. Ingestion Response Schema

### Success Response (HTTP 201 Created)
```json
{
  "eventId": "EV-TOYOTA-2026-001",
  "correlationId": "CORR-PROD-TOYOTA-001",
  "vehicleId": "VH-1001",
  "eventType": "ENGINE_FAULT",
  "severity": "CRITICAL",
  "status": "PROCESSED",
  "normalizedStatus": "NORMALIZED",
  "processingStatus": "PROCESSED",
  "actionId": "ACT-FC95B449",
  "priority": "CRITICAL",
  "decisionSource": "RULE_ENGINE_FALLBACK",
  "message": "Telemetry event ingested and processed successfully",
  "reason": ""
}
```

### Duplicate Event Idempotency Response (HTTP 200 OK)
```json
{
  "eventId": "EV-TOYOTA-2026-001",
  "correlationId": "CORR-PROD-TOYOTA-001",
  "status": "DUPLICATE",
  "normalizedStatus": "ALREADY_PROCESSED",
  "processingStatus": "DUPLICATE",
  "message": "Event with idempotency key already processed: IDEM-TOYOTA-2026-001"
}
```

### Rejection / Validation Failure (HTTP 400 Bad Request)
```json
{
  "eventId": "EV-MALFORMED-001",
  "correlationId": "CORR-ERR-001",
  "status": "FAILED",
  "normalizedStatus": "UNRECOGNIZED",
  "processingStatus": "REJECTED",
  "message": "Unsupported OEM telemetry source or unrecognizable payload format: UNKNOWN_OEM"
}
```

---

## 5. cURL Testing Command

```bash
curl -X POST http://localhost:8080/api/v1/events/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vehyron-ingest-secure-key-2026" \
  -d '{
    "source": "SIMULATED_TOYOTA",
    "eventId": "EV-TEST-001",
    "vehicleId": "VH-1001",
    "timestamp": "2026-09-25T08:00:00Z",
    "idempotencyKey": "IDEM-TEST-001",
    "correlationId": "CORR-TEST-001",
    "payload": {
      "vehicle_id": "VH-1001",
      "oil_life": 8.5,
      "odometer": 45200,
      "battery_pct": 78.0,
      "fault": "P0300",
      "idle_minutes": 45
    }
  }'
```
