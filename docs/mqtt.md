# MQTT / IoT Device Ingestion Connector

## Overview
The VEHYRON MQTT Connector connects to MQTT v3.1.1 / v5.0 brokers for low-overhead IoT device communication (OBD-II dongles, CAN-bus transmitters, asset trackers).

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `brokerUrl` | String | Yes | MQTT broker URI (e.g. `ssl://mqtt.fleet-iot.internal:8883`) |
| `topicFilter` | String | Yes | Topic subscription filter (e.g. `vehicles/+/telemetry`) |
| `clientId` | String | Yes | Unique MQTT Client identifier |
| `qos` | Integer | No | Quality of Service: `0`, `1` (default), or `2` |
| `cleanSession` | Boolean | No | Clean session flag (default: `true`) |
| `credentialReference` | String | No | Vault reference for MQTT username/password or TLS client certificate |

## Topic Wildcard Resolution
When subscribing to `vehicles/+/telemetry`:
- The connector extracts the second segment (`+`) as `vehicleId` if not explicitly present in JSON body.
- Payload is normalized into canonical `CanonicalVehicleEvent`.
