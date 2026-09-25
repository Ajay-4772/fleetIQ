# ADR-003: Dual-Tier Persistence Strategy (H2 Dev / PostgreSQL Prod)

## Status
**ACCEPTED** (Verified in codebase)

## Context
Developers and automated CI pipelines need to run unit/integration tests quickly without spinning up external PostgreSQL instances or Docker daemons. However, production fleet deployments demand the concurrency, durability, JSON querying, and indexing capabilities of PostgreSQL.

## Decision
1. Configure Spring Profiles to support dual database backends:
   - `dev` (default): Embedded H2 in-memory database with `MODE=PostgreSQL`. Allows instant startup and zero setup for local development.
   - `postgres`: Activates PostgreSQL JDBC driver targeting containerized or cloud managed PostgreSQL instances.
2. Maintain standard Spring Data JPA annotations that run identically across H2 and PostgreSQL dialects.

## Consequences
### Positive
- `mvn test` runs all 42 tests in under 90 seconds without external database dependencies.
- Rapid developer onboarding.
### Negative / Trade-offs
- Slight dialect divergence between H2's PostgreSQL compatibility mode and true PostgreSQL (e.g., advanced JSONB operators).
- Production deployments must strictly use `SPRING_PROFILES_ACTIVE=postgres`.
