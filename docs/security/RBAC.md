# VEHYRON — Role-Based Access Control (RBAC) Specification

**Document Version:** 2.0.0-PROD  
**Specification:** Multi-Tiered Enterprise Authorization, Role Hierarchy, and Server-Side Method Security  
**Target Compliance:** ISO 27001 A.9, SOC 2 Common Criteria 6.1, 6.2, 6.3

---

## 1. Architectural Philosophy

VEHYRON implements strict, server-side Role-Based Access Control (RBAC). In accordance with Zero-Trust principles:
1. **The Backend is Authoritative:** Frontend role checks and conditional UI rendering exist solely for user experience and cognitive ergonomics. Hiding a button or menu item is never treated as a security boundary.
2. **Deny by Default:** All administrative, mutating, and sensitive routes require explicit authority. Unauthenticated requests receive HTTP 401; authenticated requests with insufficient privileges receive HTTP 403.
3. **Real-Time Freshness:** Permissions and role memberships are evaluated against the current database state on every incoming request. Role changes made by an administrator take effect instantaneously with zero propagation lag.

---

## 2. Defined System Roles

VEHYRON categorizes platform actors into four distinct enterprise roles:

### 2.1. `ROLE_ADMIN` (Platform Administrator)
- **Scope:** Full operational, security, and administrative governance across the entire VEHYRON instance.
- **Key Capabilities:**
  - Complete user lifecycle administration (create, activate, deactivate, update roles, revoke sessions).
  - Inspection of security audit logs (`/api/v1/admin/users/audit-logs`).
  - System health monitoring and database schema administration.
  - Telematics simulator control and high-volume synthetic load generation.
  - Full access to all operations, vehicles, AI copilot, and action escalation workflows.

### 2.2. `ROLE_OPERATIONS_LEAD` (Fleet Operations Lead)
- **Scope:** Supervisory fleet management, operational triage, and priority action approval.
- **Key Capabilities:**
  - Action status escalation (`PENDING` -> `IN_PROGRESS` -> `RESOLVED` / `DISMISSED`) with audit notes.
  - High-frequency live telematics monitoring and multi-OEM vehicle filtering.
  - AI Copilot operational querying and RAG telemetry diagnostics.
  - Telematics simulator batch execution for training and scenario planning.
  - **Prohibitions:** Cannot manage platform users, alter security configurations, or access audit log endpoints.

### 2.3. `ROLE_OPERATOR` (Fleet Operations Dispatcher)
- **Scope:** Active real-time telematics dispatch, vehicle tracking, and routine work order progression.
- **Key Capabilities:**
  - Real-time telematics monitoring and status updates on assigned vehicle actions.
  - AI Copilot operational troubleshooting for active fleet anomalies.
  - **Prohibitions:** Cannot alter user roles, access administrative APIs, or trigger simulator scenarios.

### 2.4. `ROLE_VIEWER` (Executive / Auditor / Stakeholder)
- **Scope:** Read-only observational visibility across fleet metrics, vehicle health scores, and operational dashboards.
- **Key Capabilities:**
  - View-only access to dashboard statistics, vehicle lists, and priority actions.
  - **Prohibitions:** Cannot execute mutations, resolve priority actions, run the simulator, manage users, or modify configurations.

---

## 3. Server-Side Method Security (`@PreAuthorize`)

Authorization is strictly enforced in Spring Boot controllers using Jakarta annotations:

```java
// Example: Admin-only user governance
@PreAuthorize("hasRole('ADMIN')")
@PostMapping
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) { ... }

@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}/role")
public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) { ... }

@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/{id}/status")
public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) { ... }

// Example: Operator & Admin mutating actions
@PreAuthorize("hasAnyRole('OPERATOR', 'OPERATIONS_LEAD', 'ADMIN')")
@PatchMapping("/api/v1/actions/{id}/status")
public ResponseEntity<ActionResponse> updateActionStatus(@PathVariable String id, @RequestBody ActionStatusRequest req) { ... }
```

---

## 4. Permission Mapping Matrix

VEHYRON maps high-level business permissions to explicit enterprise roles. For the exhaustive permission-to-endpoint matrix, see [RBAC_MATRIX.md](file:///c:/Users/ajaya/Desktop/fleetiq/docs/security/RBAC_MATRIX.md).

| Permission String | Description | `ROLE_ADMIN` | `ROLE_OPERATIONS_LEAD` | `ROLE_OPERATOR` | `ROLE_VIEWER` |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `USER_READ` | View user directory | Yes | No | No | No |
| `USER_MANAGE` | Create, edit, toggle users | Yes | No | No | No |
| `ROLE_ASSIGN` | Update user roles | Yes | No | No | No |
| `AUDIT_READ` | View security audit logs | Yes | No | No | No |
| `VEHICLE_READ` | View vehicles and telemetry | Yes | Yes | Yes | Yes |
| `ACTION_READ` | View priority actions | Yes | Yes | Yes | Yes |
| `ACTION_UPDATE` | Transition action status | Yes | Yes | Yes | No |
| `SIMULATOR_RUN` | Trigger telematics simulator | Yes | Yes | No | No |
| `AI_COPILOT` | Query conversational AI | Yes | Yes | Yes | Yes (Read) |
| `SYSTEM_HEALTH` | View health and diagnostics | Yes | Yes | Yes | Yes |

---

## 5. Real-Time Authorization Propagation

VEHYRON eliminates authorization drift through its **per-request entity lookup pipeline**:

1. Client sends request with Bearer JWT.
2. `JwtAuthenticationFilter` validates cryptographic signature and expiry.
3. Filter extracts username and calls `userRepository.findByUsername(username)`.
4. If the user was demoted or deactivated in the database moments prior:
   - If `user.isEnabled() == false`, request is immediately terminated with **401 Unauthorized**.
   - If `user.getRole()` was altered, the `UsernamePasswordAuthenticationToken` is created using the **new authority from the database**, completely superseding the claims encoded in the JWT.
5. Spring Security evaluates `@PreAuthorize` against the fresh authority.
6. Propagation delay: **0 seconds** (instantaneous on subsequent request).
