# API Gateway Service

This service is the single entry point planned for frontend traffic.

## Responsibilities

- Expose one public API base URL for browser clients.
- Apply CORS policy at the platform edge.
- Forward authentication headers to downstream services.
- Emit basic request logs with method, path, status code, and duration.
- Expose health endpoints for the platform edge.
- Keep business rules inside the domain services.

## Non-responsibilities

- It must not own user, activity, grade, enrollment, or class business rules.
- It must not duplicate auth-service or academic-service persistence.
## Current Endpoints

- `GET /`
- `GET /health`
- `GET /responsibilities`
- `ANY /auth/{path}`
- `ANY /academic/{path}`

## Routing Contract

- `/auth/*` forwards to `AUTH_SERVICE_URL/auth/*`.
- `/academic/*` forwards to `ACADEMIC_SERVICE_URL/*`.

Examples:

- `POST /auth/login` -> `auth-service /auth/login`
- `GET /auth/me` -> `auth-service /auth/me`
- `GET /academic/disciplinas` -> `academic-service /disciplinas`
- `PATCH /academic/entregas/e1/nota` -> `academic-service /entregas/e1/nota`
