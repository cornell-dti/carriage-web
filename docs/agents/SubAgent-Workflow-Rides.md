## Sub-Agent: Workflow — Rides Lifecycle

### Objective
Explain the end-to-end rides lifecycle: creation, assignment, status transitions, completion, cancellation.

### In-Scope Paths
- Frontend: `frontend/src/components/RideDetails/**`, `frontend/src/components/RideStatus/**`, `frontend/src/components/RequestRideModal/**`, `frontend/src/pages/**`
- Server: `server/src/router/ride.ts`, `server/src/models/ride.ts`, `server/src/util/repeatingRide.ts`

### Required Outputs
- `docs/output/workflows/RidesLifecycle.md`: Diagrams and sequence charts for status changes and data updates.

### Checklist
- [ ] Enumerate ride statuses and allowed transitions
- [ ] Document creation flows (single and repeating rides)
- [ ] Detail driver assignment and updates
- [ ] Describe notifications tied to ride events


