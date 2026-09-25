# VEHYRON — Customer Onboarding Guide

## Overview
This document guides enterprise fleet operations and telematics engineering teams on connecting external fleet data infrastructure to the VEHYRON platform.

## Onboarding Walkthrough

### Step 1: Administrator Account Setup
1. Deploy VEHYRON platform via Docker Compose or Kubernetes Helm charts.
2. Sign in with initialized platform governance credentials (`admin` / initial secure password).
3. Under **Administration -> User Directory** (`/admin/users`), invite initial operators and configure roles.

### Step 2: Choose Data Ingestion Mode
VEHYRON supports real-time streaming, automated webhook pushes, or batch dataset imports.

#### Scenario A: Enterprise Kafka Telemetry
1. Open **Data Ingestion** (`/admin/ingestion`).
2. Click **Connect Data Source** -> select **Apache Kafka**.
3. Provide Bootstrap Servers (e.g. `kafka.telematics.internal:9092`), topic name, and consumer group.
4. Click **Test Handshake** -> VEHYRON verifies topic accessibility and message reachability.
5. Review inferred schema mapping and click **Activate & Start Ingestion**.
6. The ingestion status indicator transitions to **`LIVE`**, and incoming vehicle signals appear in real time on the **Operations Intelligence Center**.

#### Scenario B: Telematics Hardware Webhook
1. In **Data Ingestion**, select **Add Connector** -> **Secure Webhook**.
2. Provide a name (e.g. `Geotab Hardware Gateway`).
3. VEHYRON provides a dedicated endpoint:
   `POST https://vehyron.enterprise.com/api/v1/ingestion/webhooks/[sourceId]`
4. Configure your telematics gateway to push event payloads to this URL with an optional HMAC secret header.

#### Scenario C: Existing Excel / CSV Fleet Asset List
1. Open **Data Ingestion** -> **Batch Upload (Excel / CSV)**.
2. Drag and drop `.xlsx` or `.csv` dataset containing vehicle IDs, VINs, makes, and telemetry snapshots.
3. Review schema inspection and column mapping preview.
4. Click **Confirm & Process Import**.
5. All vehicles automatically populate into the **Fleet Asset Registry** and health indices are calculated immediately.

### Step 3: Operational Monitoring
- Operators sign in via the login portal (`Role: Operator`).
- Monitor live operations telemetry, inspect DTC codes in Diagnostics, review prioritized dispatch actions, and query the **VEHYRON Intelligence Copilot** for AI-assisted RAG analysis.
