# Google Cloud Pub/Sub Connector

## Overview
The Google Cloud Pub/Sub connector allows VEHYRON to subscribe to cloud-native messaging topics hosted on Google Cloud Platform for distributed telematics ingestion.

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `projectId` | String | Yes | GCP Project ID (e.g., `vehyron-telematics-prod`) |
| `subscriptionId` | String | Yes | Pub/Sub Subscription ID |
| `credentialReference` | String | Yes | Vault pointer to GCP Service Account JSON key |
| `maxMessagesPerBatch` | Integer | No | Max messages pulled per poll (default: 500) |
| `ackDeadlineSeconds` | Integer | No | Acknowledgment deadline (default: 60s) |

## Authentication
VEHYRON utilizes Google Cloud SDK client libraries server-side. Service account credentials are kept strictly isolated and never transmitted to the browser or frontend state.
