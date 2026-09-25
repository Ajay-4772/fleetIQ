# FleetIQ — Credentials & Secret Management Architecture

**Document Version:** 1.0.0-PROD  
**Classification:** Secret Management Governance  
**Audience:** Security Engineers, DevOps

---

## 1. Secret Hygiene Invariant

FleetIQ strictly enforces a **Zero-Hardcoded-Secret Policy**:
- No database passwords, JWT private keys, or third-party API tokens are committed to Git.
- The `.gitignore` excludes all `.env`, `.pem`, `.key`, and `.credentials` files.
- `.env.example` provides only sanitized variable templates for local developer orientation.

---

## 2. Production Secret Manifest & Injection Locations

| Environment Variable | Target Component | Production Storage Location | Required Value Specification |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL Connection | AWS Secrets Manager / Vault | High-entropy 32-character alphanumeric password. |
| `JWT_SECRET` | Spring Security JWT Signing | AWS Secrets Manager / Vault | 256-bit cryptographically random base64 string (`openssl rand -base64 32`). |
| `FLEETIQ_AI_API_KEY` | Optional External LLM | AWS Secrets Manager / Vault | Issued enterprise provider API key. |
| `FLEETIQ_INGEST_API_KEY` | OEM Ingestion Webhook | AWS Secrets Manager / Vault | High-entropy pre-shared key for telematics gateway. |

---

## 3. Secret Injection into Containers (Kubernetes Example)

In production Kubernetes manifests, secrets are mounted as environment variables from sealed secrets or external secrets operators:
```yaml
env:
  - name: SPRING_DATASOURCE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: fleetiq-db-secret
        key: password
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: fleetiq-auth-secret
        key: jwt-secret
```
Plaintext injection via plain configmaps or Dockerfile `ENV` is strictly prohibited.
