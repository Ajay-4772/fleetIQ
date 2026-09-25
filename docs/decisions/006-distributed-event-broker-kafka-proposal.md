# ADR-006: Distributed Event Broker Migration (Kafka/RabbitMQ)

## Status
**PROPOSED**

## Context
Currently, telemetry ingestion executes synchronously over HTTP POST endpoints or via the in-process synthetic simulator. As vehicle fleets scale beyond 10,000 active connected vehicles emitting telemetry every 1–5 seconds, synchronous HTTP ingestion risks exhausting servlet worker threads and introduces backpressure bottlenecks.

## Proposed Decision
1. Introduce Apache Kafka or RabbitMQ as the telemetry ingestion message backbone.
2. Direct raw OEM webhooks to a lightweight ingestion gateway that publishes directly to an `oem.telemetry.raw` topic partitioned by `VIN`.
3. Worker consumer groups read partitions in order, executing normalization, anomaly detection, and decision evaluation asynchronously.

## Consequences
### Positive
- High throughput and horizontal scalability with strict per-VIN event ordering.
- Resilient buffering during backend maintenance or sudden load spikes.
### Negative / Trade-offs
- Operational overhead of running a distributed message broker cluster.
- Eventual consistency considerations for dashboard updates.
