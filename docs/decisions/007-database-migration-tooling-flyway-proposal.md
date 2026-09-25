# ADR-007: Database Schema Migration Tooling (Flyway)

## Status
**ACCEPTED** (Implemented and Verified)

## Context
VEHYRON previously utilized Hibernate's `ddl-auto: update` setting for schema evolution in development and production profiles. In industry-level production environments, automatic DDL updates can lead to unintended schema locks, data corruption, or inability to safely roll back failed releases.

## Decision
1. Introduce Flyway (`org.flywaydb:flyway-core` and `org.flywaydb:flyway-database-postgresql`) into `backend/pom.xml`.
2. Disable Hibernate DDL auto-mutation across all profiles (`spring.jpa.hibernate.ddl-auto: validate`).
3. Maintain sequential SQL migration files under `src/main/resources/db/migration/V1__*.sql`.
4. Establish `V1__initial_schema.sql` defining `vehicles`, `canonical_vehicle_events`, `fleet_actions`, `fleet_decisions`, `raw_ingestion_records`, and `users` with indexes and constraints compatible with both PostgreSQL and H2 (PostgreSQL compatibility mode).
5. Run migrations deterministically during Spring Boot application startup before Hibernate validation.

## Consequences
### Positive
- Predictable, version-controlled, and immutable database schema history.
- Hibernate strictly validates schema conformity on startup, catching discrepancies early.
- Safe rollback paths and reproducible test environments across local and containerized stacks.
### Negative / Trade-offs
- Developers must author explicit, incremental SQL migration scripts (`V2__*.sql`) for any future entity alterations.
