# REST API Polling Connector

## Overview
The REST Poller connector executes scheduled HTTP requests to third-party OEM telematics APIs (e.g. BMW CarData, Toyota Connected Services, Ford Pro Telematics) with exponential backoff and rate-limit preservation.

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `endpointUrl` | String | Yes | Partner OEM API URL (e.g. `https://api.oem-partner.com/v2/telemetry`) |
| `pollingIntervalSeconds`| Integer | Yes | Interval between poll cycles (default: 30s) |
| `authType` | String | Yes | `OAUTH2_BEARER`, `API_KEY_HEADER`, or `BASIC` |
| `credentialReference` | String | Yes | Backend vault key for secret/token |
| `vehicleIdField` | String | No | JSON path to unit identifier (default: `vehicle_id`) |
| `timestampField` | String | No | JSON path to timestamp (default: `timestamp`) |

## Rate Limit Handling
- Evaluates `Retry-After` and `X-RateLimit-Reset` HTTP headers.
- Automatically throttles requests when rate limits are approached.
