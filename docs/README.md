## Documentation Agents Overview

This directory contains a parent documentation agent brief and sub-agent briefs to produce comprehensive documentation for the entire codebase.

### Structure
- `agents/ParentAgent.md`: Orchestrates the documentation effort, defines scope and standards.
- `agents/SubAgent-Auth.md`: Authentication and authorization across frontend and server.
- `agents/SubAgent-Components.md`: Frontend UI components and pages.
- `agents/SubAgent-State.md`: Frontend state (contexts, hooks), data flow.
- `agents/SubAgent-Models.md`: Server-side data models and schemas.
- `agents/SubAgent-APIs.md`: Server REST APIs/routers, contracts, error semantics.
- `agents/SubAgent-Utils.md`: Utilities and shared modules.
- `agents/SubAgent-Tests.md`: Tests, fixtures, and coverage strategy.
- `agents/SubAgent-BuildOps.md`: Build, deploy, environments, and operations.
  
#### Functional (How the app works)
- `agents/SubAgent-Workflow-Rides.md`: Rides lifecycle.
- `agents/SubAgent-Workflow-Booking.md`: Booking and requests.
- `agents/SubAgent-Workflow-DriverOps.md`: Driver operations.
- `agents/SubAgent-Workflow-RiderExperience.md`: Rider experience.
- `agents/SubAgent-Workflow-Scheduling.md`: Scheduling and repeating rides.
- `agents/SubAgent-Workflow-Notifications.md`: Notifications.
- `agents/SubAgent-Workflow-Admin.md`: Admin operations.

### Output Targets
Agents should produce Markdown documentation under `docs/output/` mirroring this structure.

### Codebase Roots
- Frontend: `/Users/atikpui/Desktop/Programming/DTI/carriage-web/frontend/src`
- Server: `/Users/atikpui/Desktop/Programming/DTI/carriage-web/server/src`

### Style Guide (short)
- Audience: engineers new to the repo.
- Keep sections task-oriented with examples and references to source files.
- Prefer small code excerpts and link to files/lines rather than large pastes.


