# FleetIQ — Enterprise Data Privacy Policy

> [!CAUTION]
> **LEGAL REVIEW REQUIRED:** This document is an enterprise data privacy template tailored to the actual data ingestion characteristics of FleetIQ. It must be reviewed and certified by corporate data protection officers (DPO) and compliance legal counsel prior to production operation.

**Template Version:** 2026.1-STABLE  
**Scope:** Telematics Data Ingestion, User Accounts, and AI Conversation Privacy

---

## 1. Actual Categories of Data Ingested

FleetIQ processes telemetry directly relevant to commercial fleet operations:

1. **User Identity & Security Data:** Username, full name, corporate email address, hashed passwords, security role (`ROLE_ADMIN`, `ROLE_OPERATOR`, `ROLE_ANALYST`, `ROLE_VIEWER`), login timestamps, and client IP addresses stored in `user_audit_logs`.
2. **Vehicle Telematics & Asset Identifiers:** Vehicle Identification Numbers (VIN), OEM make/model, odometer readings, vehicle speed, engine coolant temperature, High Voltage battery State of Charge (SOC), battery cell temperature, and tire pressure metrics.
3. **Diagnostic Trouble Codes (DTC):** Standardized OBD-II and OEM manufacturer fault codes (e.g. `P0A80`, `P0300`).
4. **Conversational Copilot Data:** Natural-language prompts submitted by operators, AI response texts, cited OEM source references, and confidence tags stored in `chat_conversations` and `chat_messages`.
5. **PII Exclusion:** The platform **does not collect, store, or process** passenger names, personal phone numbers, biometric data, payment card details, or consumer passenger infotainment browsing history.

---

## 2. Storage, Retention & Access Controls

- **Database Storage:** All telematics and user records are stored in enterprise PostgreSQL databases with AES-256 encryption at rest.
- **Tenant & User Isolation:** AI Copilot conversations are partitioned strictly by authenticated user ID; cross-user conversational retrieval is prevented at the JPA repository boundary.
- **Retention Schedule:** Operational vehicle telemetry is retained for 90 days in active tables before archival; security audit logs are retained for 365 days in append-only tables for compliance auditing.

---

## 3. Third-Party Services & AI Processing

- **No Public LLM Training:** Telematics data and user queries are never transmitted to public model providers for AI training.
- **Deterministic RAG:** Knowledge retrieval operates against curated in-memory or private vector databases containing public OEM engineering documentation.

---

## 4. Privacy Contact & Data Subject Rights
Requests regarding account deletion or data subject access audits should be submitted to:  
`privacy@[COMPANY_DOMAIN_PLACEHOLDER]`
