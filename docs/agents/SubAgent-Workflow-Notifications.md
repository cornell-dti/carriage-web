## Sub-Agent: Workflow — Notifications

### Objective
Document notification triggers, channels (push/email/SMS if any), and message templates.

### In-Scope Paths
- Server: `server/src/util/notification.ts`, `server/src/util/notificationMsg.ts`, `server/src/util/notificationReceivers.ts`, `server/src/router/notification.ts`, `server/src/models/notification.ts`
- Frontend: `frontend/src/components/Notification/**`, service worker in `frontend/public/notification-sw.js`

### Required Outputs
- `docs/output/workflows/Notifications.md`: Event-to-message mapping and delivery flow.

### Checklist
- [ ] Notification event sources and payloads
- [ ] Receivers, preferences, and opt-in/out
- [ ] Error handling and retries


