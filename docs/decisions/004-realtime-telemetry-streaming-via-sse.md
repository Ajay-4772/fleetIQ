# ADR-004: Real-Time Telemetry Streaming via Server-Sent Events

## Status
**ACCEPTED** (Verified in codebase)

## Context
Fleet dispatchers require instant updates as incoming telemetry triggers new faults, action items, or status changes. Client-side HTTP polling creates excessive database load and stale data. WebSockets introduce bidirectional overhead, connection state management complexity, and firewall/proxy issues.

## Decision
1. Implement unidirectional real-time streaming using Server-Sent Events (SSE) via Spring's `SseEmitter` at `/api/v1/dashboard/stream`.
2. Manage active connections inside a thread-safe registry (`SseService`).
3. Broadcast events (`vehicle_update`, `action_update`, `metrics_update`) as soon as normalized events or decisions are persisted.
4. Support automatic reconnects and heartbeats from the browser client via standard `EventSource` API.

## Consequences
### Positive
- Operates over standard HTTP/1.1 and HTTP/2 without protocol upgrades.
- Seamless compatibility with standard corporate firewalls, API gateways, and existing Bearer token authentication.
- Minimal server overhead compared to bi-directional WebSockets.
### Negative / Trade-offs
- Unidirectional only; client requests (e.g. status updates) must be sent via separate REST endpoints.
- In multi-instance deployments, requires Redis Pub/Sub or similar broker to fan out events to all SSE emitters.
