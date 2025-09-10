# Ride Table and RideDetailView — Instruction Spec

Some notes before the main info : to run use npm run start:frontend and npm run start:server. You can run npm run lint as well

MATERIAL UI AND TAILWIND ARE USED THROUGHOUT

If there are components that you see already exist but do not follow the correct convention rewrite them. Also make it so the components are reusable throughout. 

In my opinion we will need a 

RideDetailsComponent (parent)
RideMap Component
RideOverview Component
RidePeople Component
RideActionsComponent

The trickiest part will be for the editing but this can be done if you use proper components. Note that we are creating all these as new components and might replace old ones in the future so look at the way some of the things are done for example 
- Distance and time estimation are shown in the Driver folder under the NextRide cards etc
- Maps are shown in several places
- forms are also shown in several places

It is not necessary to add comments but when you are done with the task then you can write a summary file 

Note - Use the types that are present and do not hallucinate / make assumptions about any types or backend roles. 


## 1. Core domain definition

### 1.1 What is a Ride

A Ride represents a transport request that links a rider and an optional driver between two locations during a time window. It has a lifecycle managed by `status` and a scheduling lifecycle managed by `schedulingState`. Timezone can be attached for correct display. Recurrence metadata is present but is not yet actionable.

```ts
export type RideType = {
  id: string;
  type: Type; 
  status: Status;
  schedulingState: SchedulingState;
  startLocation: LocationType;
  endLocation: LocationType;
  startTime: string; 
  endTime: string;   
  rider: RiderType;
  driver?: DriverType;

  isRecurring: boolean;
  rrule?: string;     // RFC 5545 text string as provided
  exdate?: string[];  // ISO 8601 strings
  rdate?: string[];   // ISO 8601 strings
  parentRideId?: string;
  recurrenceId?: string;
  timezone?: string;  // e.g. "America/New_York"
};
```

### 1.2 Derived fields used in UI

These are not persisted. Compute in the client.

- `Type`: one of `Past`, `Active`, `Upcoming` based on current clock vs `startTime` and `endTime`.
  - Past if `endTime` < now
  - Active if `startTime` ≤ now < `endTime`
  - Upcoming if now < `startTime`
- recurrence: if `isRecurring` and `rrule` exists then display `rrule` in a UI friendly way. 

---

## 2. Roles and permissions

| Capability                               | Rider                                        | Driver | Admin                 |
| ---------------------------------------- | -------------------------------------------- | ------ | --------------------- |
| View own rides table                     | Yes                                          | Yes    | n/a                   |
| View rider rides table from person view  | n/a                                          | n/a    | Yes                   |
| View driver rides table from person view | n/a                                          | n/a    | Yes                   |
| Open RideDetailView                      | Yes                                          | Yes    | Yes                   |
| Edit ride                                | Only when `schedulingState` is `UNSCHEDULED` | No     | Yes                   |
| Cancel ride                              | Only when `schedulingState` is `UNSCHEDULED` | No     | Yes                   |
| Update status                            | No                                           | Yes    | Yes                   |
| Report issue                             | Yes                                          | Yes    | Placeholder for Admin |
| Contact Admin CTA                        | Shows for Rider when ride is scheduled       | Yes    | n/a                   |

---

## 3. Ride Table

Shared table component. Provide search, filter, sort, and pagination.

### 3.1 Common table requirements

- Row click opens RideDetailView for that ride
- Client sorting by date, status, rider, driver
- Filters
  - Date range: start to end
  - Status: multi select
  - SchedulingState: multi select
  - Temporal type: Past, Active, Upcoming
- Loading and error states

### 3.2 Suggested columns per role

**Rider view**

- Date
- Start time
- End time
- From
- To
- Status
- Scheduling state
- Type

**Driver view**

- Date
- Start time
- End time
- From
- To
- Status
- Type

**Admin view**

- Date
- Start time
- End time
- From
- To
- Status
- Scheduling state
- Type

---

## 4. RideDetailView

This is a modal. It has two sections - A Tabbed left side section ( Tabs differ per role ) and an actions panel sits on the right side for all roles.

### 4.1 Tab sets per role

- Rider: `Overview`, `Driver`, `Locations`
- Driver: `Overview`, `Rider`, `Locations`
- Admin: `Overview`, `People`, `Locations`

### 4.2 Overview tab

Show the basic ride information for all roles.

Fields:

- Date, Start time, End time
- Recurrence summary if present
- Status
- Scheduling state (show for Rider and Admin, hide for Driver)
- Temporal type derived value

### 4.3 People tab

Role aware content.

- Rider viewing: show Driver card
  - Fields: name, phone, email, photo 
- Driver viewing: show Rider card
  - Fields: name, phone, email, photo, accessibility needs chips if present
- Admin viewing: show two stacked cards ( horizontally ) 
  - Rider card and Driver card with the fields above

### 4.4 Locations tab

- Map preview of route with start and end markers ( right side ) 
- Address blocks for start and end with copy to clipboard ( left side ) 
- Distance and estimated time ( below address blocks ) 
  - Use existing distance and ETA util if present ( Current distance is shown in the Driver so move that to common util ) 

### 4.5  actions panel

Persistent panel on the right side of the detail view. Use vertical buttons ( Icon and Text ) responsive to only icon for smaller screens.

Actions by role:

- Rider
  - If `schedulingState` is `UNSCHEDULED`: `Edit`, `Cancel`, `Report`
  - Otherwise: `Contact Admin` primary, `Report` secondary
- Driver
  - `Update Status` only, `Report`
- Admin
  - `Edit`, `Cancel`, `Placeholder` for report

Disable rules and visibility reflect the matrix in section 2.

---

## 5. Action rules and flows

### 5.1 Edit

- Rider can edit only when `schedulingState` is `UNSCHEDULED`
- Admin can edit at all times
- Driver cannot edit
- Edit dialog shows only allowed fields for the role
  - Rider editable fields: start time, end time, start location, end location, special notes if defined by backend
  - Admin editable fields: rider assignment, driver assignment, times, locations, scheduling state

### 5.2 Cancel

- Rider can cancel only when `schedulingState` is `UNSCHEDULED`
- Admin can cancel at all times
- Driver cannot cancel
- Confirmation modal with summary

### 5.3 Update status

- Driver can move status forward only. Provide a simple linear list.
  - Allowed transitions example: use your discretion based on defined enum
  - Edge transitions available: `SCHEDULED -> CANCELLED`, `SCHEDULED -> NO_SHOW`
- Admin can set any status

> If backend provides a transition map then wire to that source of truth

### 5.4 Contact Admin

- Rider sees this when ride is not editable
- Opens contact sheet with phone and email to admin. A component is defined for this if not search thruogh and move to common component

---

## 6. Component structure and props

### 6.1 UI guidelines

- Use MUI `Tabs` for the tab strip
- Use MUI `Card` for person cards
- On mobile the actions panel collapses into a sticky bottom sheet

### 6.2 Accessibility

- All action buttons must have aria labels
- Table rows must be keyboard focusable and activatable with Enter
- Color is not the only indicator for status

## 8. Validation and guards

- Date and time must be valid ISO 8601 strings
- Start time must be before end time
- When status is `COMPLETED` the action panel disables all mutating actions except `Report`
- When `schedulingState` is `UNSCHEDULED` the Rider action panel shows `Edit` and `Cancel`

---

## 9. Edge cases

- Missing driver, display "Not assigned"
- Recurring series with `parentRideId` and `recurrenceId` should display a small badge like "Series"
- Cancelled rides show a red status chip and actions disabled per rules

---

---

---

## 13. Copy spec

- Rider contact CTA: "Contact Admin"
- Driver update CTA: "Update Status"
- Rider edit CTA: "Edit"
- Rider cancel CTA: "Cancel"
- Admin edit CTA: "Edit"
- Admin cancel CTA: "Cancel"
- Admin placeholder CTA: "Actions"
- Recurrence badge: "Preview"
- Series badge: "Series"
-

