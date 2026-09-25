# FleetIQ — Third-Party Services & Integration Inventory

**Document Version:** 1.0.0-PROD  
**Classification:** Procurement & Service Governance  
**Audience:** IT Leadership, Procurement, Cloud Engineering

---

## 1. External Service Dependency Registry

> [!NOTE]
> In accordance with security protocol, this document contains no plaintext credentials or API keys. All credentials reside strictly in corporate secret managers.

| Service Name | Category | Primary Purpose | Failure Impact | Replacement / Fallback Strategy | Company Ownership |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AWS / GCP / Azure** | Cloud Infrastructure | Hosts Kubernetes/ECS clusters, PostgreSQL RDS, and S3 object storage. | Platform downtime. | Multi-cloud container portability (OCI-compliant Docker images). | Cloud Engineering Team |
| **PostgreSQL RDS** | Database | Authoritative relational persistence for vehicles, actions, users, and audit logs. | Read/write failure. | Automated Multi-AZ replica failover. | Database Administration (DBA) |
| **Redis Cloud / ElastiCache** | Caching & PubSub | Distributed rate limiting, SSE backplane, and session blacklisting. | Fallback to in-memory rate limiting and single-pod SSE. | Redis Cluster or in-memory fallback. | SRE Team |
| **AI Model Provider (Optional JEV / OpenAI / Claude)** | AI Inference | Synthesizing conversational explanations for AI Copilot. | Copilot enters fallback mode. | `DeterministicGroundedProvider` executes immediately with zero downtime. | AI / Data Engineering |
| **GitHub Enterprise** | Source Control & CI/CD | Code repository, pull request reviews, and GitHub Actions CI pipelines. | Halts deployments; production remains unaffected. | GitLab / Bitbucket mirror. | DevOps Team |
| **Cloudflare / AWS CloudFront** | CDN & WAF | Edge caching of static frontend assets, DDoS mitigation, and SSL termination. | Traffic routed directly to ALB origin. | Route 53 / Fastly failover. | SecOps Team |
| **SendGrid / AWS SES (Planned)** | Notification / Mail | Administrative user password reset tokens and critical fleet alert emails. | Delayed notifications. | Operational SMS / Webhook fallback. | IT Operations |
