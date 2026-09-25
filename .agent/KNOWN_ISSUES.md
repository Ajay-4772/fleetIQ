# FleetIQ — Known Issues & Technical Debt

**Last Reviewed**: September 25, 2026

---

## 1. Active Architectural & Platform Constraints

### 1.1 In-Memory SSE Emitter Registry (Single-Node Limitation)
- **Component**: `com.fleetiq.service.sse.SseService`
- **Issue**: SSE client connections are maintained in a concurrent in-memory map. When the backend is scaled horizontally across multiple container instances, clients connected to Instance A will not receive telemetry broadcasts initiated by Instance B.
- **Remediation Plan**: Introduce a Redis Pub/Sub or RabbitMQ fanout broker to broadcast telemetry events across all container instances before delivering to local SSE emitters (tracked in future scalability milestones).

### 1.2 Synchronous Ingestion Flow Under Heavy Telemetry Load
- **Component**: `com.fleetiq.controller.SimulatorController` / Ingestion API
- **Issue**: Incoming events are normalized, diagnosed, evaluated, and saved synchronously on the HTTP request thread. Heavy bursts of concurrent telemetry could exhaust the Tomcat thread pool.
- **Remediation Plan**: Transition to an asynchronous message-driven architecture using Kafka or RabbitMQ (tracked in `docs/decisions/006-distributed-event-broker-kafka-proposal.md`).

### 1.3 Windows Husky Git Hook File Modes
- **Component**: `.husky/` hooks on Windows NTFS
- **Issue**: Windows NTFS does not track POSIX execute permissions (`0o755`), causing Agent Compass doctor to report an advisory status on hook executability. Git hooks execute properly within Git for Windows bash environments.
- **Remediation Plan**: Advisory only; no runtime impact on backend or frontend execution.

---

## 2. Resolved Architectural Issues

### 2.1 Hibernate `ddl-auto: update` in Production — RESOLVED
- **Component**: `backend/src/main/resources/application.yml` and `db/migration/V1__initial_schema.sql`
- **Resolution**: Replaced Hibernate auto-mutation with Flyway database migration tooling (`V1__initial_schema.sql`) and enforced `spring.jpa.hibernate.ddl-auto: validate` across both dev and postgres profiles (ADR-007).
