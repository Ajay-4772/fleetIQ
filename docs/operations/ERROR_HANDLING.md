# FleetIQ — Enterprise Error Handling & Fault Taxonomy

**Document Version:** 1.0.0-PROD  
**Specification:** API Error Contracts, Status Codes, and Leakage Prevention

---

## 1. Global Error Architecture

FleetIQ routes all unhandled runtime exceptions through `GlobalExceptionHandler` (`@RestControllerAdvice`). The application strictly prohibits returning stack traces, SQL syntax exceptions, database connection strings, or server filesystem paths to external clients.

### Standardized Error Contract (`ApiErrorResponse`)
Every error response is returned with `Content-Type: application/json` conforming to this schema:
```json
{
  "timestamp": "2026-09-25T14:30:00Z",
  "status": 400,
  "code": "INVALID_ARGUMENT",
  "message": "Input validation failed for request body.",
  "path": "/api/v1/actions/ACT-1001/status",
  "correlationId": "c8f2a1b9-3e4d-4a11-8f5c-9d0e1a2b3c4d",
  "details": [
    "Field 'status': must match allowed values [OPEN, IN_REVIEW, RESOLVED, DISMISSED]"
  ]
}
```

---

## 2. HTTP Status Code Taxonomy

| HTTP Status | Error Code | Trigger Condition | Client Remediation |
| :---: | :--- | :--- | :--- |
| **400** | `INVALID_ARGUMENT` | Malformed JSON, missing required fields, enum mismatch. | Correct request payload syntax. |
| **401** | `UNAUTHORIZED` | Expired JWT token, missing `Authorization` header, invalid credentials. | Re-authenticate at `/api/v1/auth/login`. |
| **403** | `FORBIDDEN` | Caller possesses valid token but lacks required role (e.g. non-admin accessing user management). | Request elevated role assignment from Administrator. |
| **404** | `RESOURCE_NOT_FOUND` | Vehicle ID, Action ID, or Conversation ID does not exist in database. | Verify entity identifier in asset registry. |
| **409** | `CONFLICT` | Attempting to create duplicate username or conflicting state transition. | Use unique identifier. |
| **422** | `UNPROCESSABLE_ENTITY` | Telematics sensor readings violate physical invariants (e.g. speed < 0 km/h). | Check OEM sensor telemetry feed calibration. |
| **429** | `TOO_MANY_REQUESTS` | IP or account exceeded route tier rate limit. | Wait for duration specified in `Retry-After` header. |
| **500** | `INTERNAL_SERVER_ERROR` | Unexpected backend runtime fault. Stack trace logged server-side only. | Provide `correlationId` to FleetIQ Operations Support. |
| **503** | `SERVICE_UNAVAILABLE` | Database migration in progress or dependent broker temporarily unreachable. | Retry request after short exponential backoff. |
