# AWS Kinesis Stream Connector

## Overview
The AWS Kinesis connector enables continuous consumption of real-time vehicle telemetry data records from Amazon Kinesis Data Streams.

## Configuration Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `streamName` | String | Yes | Kinesis Data Stream name (e.g., `vehyron-vehicle-stream`) |
| `region` | String | Yes | AWS Region (e.g., `us-east-1`, `eu-central-1`) |
| `credentialReference` | String | Yes | IAM Role ARN or Vault AWS Access Key ID pointer |
| `iteratorType` | String | No | `LATEST` (default) or `TRIM_HORIZON` |

## Security
IAM Role authentication is utilized with least-privilege permissions (`kinesis:GetRecords`, `kinesis:GetShardIterator`, `kinesis:DescribeStream`).
