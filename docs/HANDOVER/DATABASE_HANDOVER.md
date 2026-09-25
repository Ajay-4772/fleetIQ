# VEHYRON — Database Operations & Migration Handover

**Document Version:** 1.0.0-PROD  
**Classification:** Database Architecture & Schema Governance  
**Audience:** Database Administrators (DBA), Backend Engineers

---

## 1. Database Engine & Schema Governance

VEHYRON exclusively utilizes **PostgreSQL 15+** with versioned, reproducible Flyway migration scripts. In-memory H2 is retained only for lightning-fast, zero-dependency unit tests during `mvn test`.

### Migration Scripts Location
All schema definitions reside in `backend/src/main/resources/db/migration/`:
- `V1__initial_schema.sql`: Core telematics schema:
  - `vehicles`: Connected fleet assets with VIN, make, model, telemetry score.
  - `vehicle_events`: Ingested multi-OEM sensor telemetry payloads.
  - `priority_actions`: Decision engine work orders with severity and status.
- `V2__user_audit_and_copilot_chat.sql`: Security and Copilot persistence schema:
  - `users`: User identity with bcrypt hashed passwords and RBAC roles.
  - `user_audit_logs`: Immutable security audit events.
  - `chat_conversations`: Copilot threads partitioned by user.
  - `chat_messages`: Multi-turn chat messages with citations and confidence metadata.

---

## 2. Table Indexing & Query Optimization

To guarantee sub-50ms query response times under high-concurrency fleet queries:
- `idx_vehicle_events_vehicle_id`: Fast vehicle timeline reconstruction.
- `idx_priority_actions_status`: Filter for open operational work orders.
- `idx_user_audit_logs_actor`: Fast lookup by security actor.
- `idx_chat_conversations_user`: Enforces user-isolated conversation retrieval.
- `idx_chat_messages_conv_id`: Fast conversation message loading.

---

## 3. Database Migration Command Execution
```bash
# Verify pending migrations without executing
mvn flyway:info -Dflyway.url=jdbc:postgresql://localhost:5432/fleetiq -f backend/pom.xml

# Execute pending migrations
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/fleetiq -f backend/pom.xml

# Repair checksum mismatches (emergency hotfix)
mvn flyway:repair -Dflyway.url=jdbc:postgresql://localhost:5432/fleetiq -f backend/pom.xml
```
*Note: Manual DDL schema modifications on production databases are strictly prohibited.*
