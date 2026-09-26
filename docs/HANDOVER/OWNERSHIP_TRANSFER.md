# VEHYRON — Corporate Ownership & Asset Transfer Playbook

**Document Version:** 1.0.0-PROD  
**Classification:** Corporate Governance & Handover  
**Audience:** Handover Executive, Corporate Legal, IT Operations

---

## 1. Corporate Ownership Model

Production operations must not depend on any individual developer's personal accounts, laptops, or API keys. The receiving enterprise must take sole legal and administrative ownership of all digital assets.

### Digital Asset Transfer Checklist
- [ ] **GitHub Organization:** Transfer the `vehyron` repository to the company's enterprise GitHub organization (e.g. `github.com/[COMPANY_ENTERPRISE]/vehyron`).
- [ ] **Cloud Provider Account:** Migrate infrastructure workloads to corporate AWS / GCP / Azure root accounts with IAM role delegation.
- [ ] **Container Registry:** Configure private container repository (`ghcr.io/[COMPANY]` or Amazon ECR) and update CI publish secrets.
- [ ] **Domain & DNS:** Point domain names (e.g. `vehyron.company.internal`) to corporate Cloudflare or Route 53 zones.
- [ ] **Database Master Account:** Re-key production PostgreSQL database credentials and transfer billing ownership.
- [ ] **AI Model Accounts:** Procure enterprise LLM seats (OpenAI, Anthropic Claude, or JEV) billed directly to the corporate account.
- [ ] **Monitoring & SRE:** Create corporate Datadog, New Relic, or Prometheus Cloud workspaces.

---

## 2. Handover Acceptance Sign-Off Criteria

The handover is formally certified complete when the company's engineering team validates:
1. The repository clones cleanly onto an independent developer laptop without Antigravity IDE.
2. `mvn test -f backend/pom.xml` runs cleanly with 100% test pass rate.
3. `npm run build --prefix frontend` produces the optimized web bundle with 0 errors.
4. Docker Compose launches PostgreSQL, backend, and frontend containers successfully.
5. An administrator can log in, create a user account, assign a role, and inspect the security audit trail.
6. A fleet operator can inspect vehicle telemetry, change an action priority, and query the full-page AI Copilot.
