# FleetIQ — Engineering Standards & Conventions

**Standard Version**: 1.0.0  
**Effective Date**: September 25, 2026

---

## 1. Java & Spring Boot Standards

### 1.1 Architecture & Layering
- **Strict Layer Separation**: 
  - `Controller` handles HTTP protocol, status codes, and input validation only. Never put business logic in controllers.
  - `Service` encapsulates transactional business logic, domain transformations, and external API coordination.
  - `Repository` performs database queries via Spring Data JPA. Do not trigger side effects in repositories.
- **Dependency Injection**: Use constructor injection exclusively (facilitates unit testing and immutability). Avoid field injection (`@Autowired` on private fields).

### 1.2 Data Integrity & Concurrency
- **Transaction Demarcation**: Apply `@Transactional` at the service layer. Explicitly specify read-only queries with `@Transactional(readOnly = true)`.
- **Thread Safety**: Any singleton service maintaining state (such as `SseService`) must use concurrent data structures (`ConcurrentHashMap`, `CopyOnWriteArrayList`) or atomic variables (`AtomicInteger`, `AtomicReference`).
- **Idempotency**: External telemetry ingestion must be idempotent. Repeating an event submission with an identical `eventId` must not create duplicate actions or corrupt vehicle state.

### 1.3 Exception Handling & Logging
- **No Swallowed Exceptions**: Never use empty `catch` blocks. Either rethrow a typed domain exception or log with full stack trace and trigger a deterministic fallback.
- **Structured Logging**: Use SLF4J with parameterized placeholders (`logger.info("Event normalized vin={} eventId={}", event.getVin(), event.getEventId())`). Do not use string concatenation in log statements.
- **Standardized Error Envelope**: All API error responses must return standard JSON containing `status`, `message`, `timestamp`, and `path`.

---

## 2. API Design Standards

### 2.1 REST Conventions
- **Base Paths**: All application REST endpoints reside under `/api/v1/` or `/api/fleet/`.
- **Resource Naming**: Plural nouns for collections (`/api/v1/actions`, `/api/v1/vehicles`).
- **HTTP Methods**:
  - `GET`: Safe, idempotent read operations.
  - `POST`: Creation or action triggering (`/api/v1/simulator/generate`).
  - `PATCH`: Partial state modification (`/api/v1/actions/{id}/status`).
  - `DELETE`: Resource removal.

### 2.2 Time and Unit Standards
- **Timestamps**: All timestamps must be formatted as UTC ISO-8601 strings (`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`).
- **Metrics**: Speeds in `km/h`, distances in `km`, percentages as `0.0–100.0`, pressures in `PSI`, monetary values in `$USD`.

---

## 3. Frontend & TypeScript Standards

### 3.1 Component Architecture
- **Functional Components**: Use React functional components with TypeScript interfaces for props.
- **State Management**: Prefer local hooks (`useState`, `useCallback`, `useMemo`) for component state; isolate API communication into dedicated service modules (`services/api.ts`).
- **Strict Typing**: Disallow `any`. Explicitly type all API responses, event payloads, and state values.

### 3.2 UI Aesthetics & User Experience
- Adhere to the established enterprise design system: clean dark palette, clear data visual hierarchy, subtle micro-animations, and responsive tables/grids.

---

## 4. Security Standards
- **Zero Secrets in Code**: Secrets, passwords, and private tokens must be injected via environment variables.
- **Authorization**: Secure endpoints with `@PreAuthorize` or Spring Security HTTP path rules.
- **Input Sanitization**: Validate all inputs using Jakarta Bean Validation (`@NotNull`, `@Size`, `@Pattern`).
