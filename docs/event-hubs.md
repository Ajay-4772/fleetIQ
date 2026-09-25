# Azure Event Hubs Connector

## Overview
The Azure Event Hubs connector enables hyper-scale telemetry streaming into VEHYRON using Azure's native event streaming service or Kafka-compatible API surface.

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `namespace` | String | Yes | Event Hubs namespace (e.g., `vehyron-fleet-eh.servicebus.windows.net`) |
| `eventHubName` | String | Yes | Name of the event hub |
| `consumerGroup` | String | Yes | Consumer group name (`$Default` or custom) |
| `credentialReference` | String | Yes | Vault secret containing Azure Shared Access Signature (SAS) connection string |
