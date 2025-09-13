## Sub-Agent: Authentication & Authorization

### Objective
Document how auth works across frontend and server, including flows, tokens, session storage, and protected routes.

### In-Scope Paths
- Client: `frontend/src/components/AuthManager/*`, `frontend/src/context/auth.ts`, `frontend/src/components/PrivateRoute/*`, `frontend/src/util/axios.ts`.
- Server: `server/src/router/auth.ts`, `server/src/models/admin.ts`, `server/src/util/types.ts` (auth-related), any middleware in `server/src/app.ts`.

### Required Outputs
- `docs/output/auth/Overview.md`: End-to-end flow diagrams (login, token refresh if any).
- `docs/output/auth/Client.md`: Storage, guards, axios interceptors, error states.
- `docs/output/auth/Server.md`: Routes, payloads, validation, error codes.

### Checklist
- [ ] Identify auth token type and storage location
- [ ] Document `PrivateRoute` and guarding patterns
- [ ] List auth-related API endpoints with examples
- [ ] Map roles/permissions if present
- [ ] Security considerations and common pitfalls


