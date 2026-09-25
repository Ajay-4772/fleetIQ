# FleetIQ System Architecture & End-to-End Pipeline

## Core Architecture
```
External OEM / Telematics System
             ↓
       Ingestion API (POST /api/v1/events/ingest)
             ↓
      Source Identification (Toyota, Ford, BMW, Tesla)
             ↓
       OEM Adapter & Normalization
             ↓
   Canonical Vehicle Event
             ↓
      Validation & Persistence
             ↓
    Issue Detection Engine
             ↓
    Impact & Cost Calculation
             ↓
      Decision Engine (Jev AI + Rule Fallback)
             ↓
       Action Workflow Engine
             ↓
      Event Publisher
             ↓
        SSE Stream (GET /api/v1/stream/events)
             ↓
       FleetIQ Real-Time Operations UI
```

## Security Model
- JWT Token Authentication: 24-hour expiration for human operators.
- Role-based Access Control (RBAC): ADMIN, OPERATIONS_LEAD, OPERATOR, VIEWER.
- Service-to-Service API Key (`X-API-Key`): Authorizes external telematics gateways to ingest telemetry directly.

## Grounded AI vs. RAG Separation
- **Live Fleet Data**: Queries PostgreSQL/H2 database directly for current asset counts, open actions, vehicle telemetry, and risk metrics. Never retrieved via vector RAG.
- **Knowledge Base (RAG)**: Retrieves technical documentation, OBD-II DTC definitions, standard operating procedures, and normalization specifications.
