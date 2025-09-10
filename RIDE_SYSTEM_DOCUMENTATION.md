# Ride System Documentation

## Overview

The Carriage ride system is a comprehensive transportation management platform that handles ride requests, scheduling, driver assignment, and status tracking. This document provides detailed information about how rides function and how the ride table operates, with a focus on backend functionality and action button implementations.

## Table of Contents

1. [Ride Data Model](#ride-data-model)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Ride States and Status Flow](#ride-states-and-status-flow)
4. [Frontend Components](#frontend-components)
5. [Action Buttons and Functionality](#action-buttons-and-functionality)
6. [Notification System](#notification-system)
7. [Implementation Notes](#implementation-notes)

## Ride Data Model

### Core Ride Schema

The ride model is defined in `server/src/models/ride.ts` and includes the following key fields:

```typescript
export type RideType = {
  id: string;                    // Unique identifier (UUID)
  type: Type;                    // ACTIVE, PAST, or UNSCHEDULED
  status: Status;                // Operational status (see below)
  schedulingState: SchedulingState; // SCHEDULED or UNSCHEDULED
  startLocation: LocationType;   // Pickup location
  endLocation: LocationType;     // Dropoff location
  startTime: string;             // ISO 8601 timestamp
  endTime: string;               // ISO 8601 timestamp
  rider: RiderType;              // Rider information
  driver?: DriverType;           // Optional driver assignment
  
  // RFC 5545 Recurrence fields (placeholders - no functionality yet)
  isRecurring: boolean;
  rrule?: string;                // RFC 5545 recurrence rule
  exdate?: string[];             // Excluded dates
  rdate?: string[];              // Additional dates
  parentRideId?: string;         // Reference to parent ride for series
  recurrenceId?: string;         // Original start time for overrides
  timezone?: string;             // Timezone for recurrence calculations
};
```

### Ride Types

```typescript
export enum Type {
  ACTIVE = 'active',           // Currently scheduled rides
  PAST = 'past',               // Completed rides
  UNSCHEDULED = 'unscheduled', // Rides without driver assignment
}
```

### Ride Status

```typescript
export enum Status {
  NOT_STARTED = 'not_started',   // Initial state
  ON_THE_WAY = 'on_the_way',     // Driver en route to pickup
  ARRIVED = 'arrived',           // Driver arrived at pickup location
  PICKED_UP = 'picked_up',       // Rider picked up
  COMPLETED = 'completed',       // Ride finished successfully
  NO_SHOW = 'no_show',           // Rider didn't show up
  CANCELLED = 'cancelled',       // Ride was cancelled
}
```

### Scheduling State

```typescript
export enum SchedulingState {
  SCHEDULED = 'scheduled',       // Driver assigned
  UNSCHEDULED = 'unscheduled',   // No driver assigned
}
```

## Backend API Endpoints

### Core Ride Endpoints

#### GET `/api/rides`
**Purpose**: Retrieve rides with filtering options
**Query Parameters**:
- `type`: Filter by ride type (active, past, unscheduled)
- `status`: Filter by ride status
- `rider`: Filter by rider ID
- `driver`: Filter by driver ID
- `date`: Filter by specific date (YYYY-MM-DD)
- `scheduled`: Legacy boolean filter (true = not unscheduled)
- `schedulingState`: Filter by scheduling state (scheduled/unscheduled)

**Response**: Array of ride objects

#### GET `/api/rides/:id`
**Purpose**: Get a specific ride by ID
**Response**: Single ride object

#### GET `/api/rides/rider/:id`
**Purpose**: Get all rides for a specific rider
**Response**: Array of ride objects

#### POST `/api/rides`
**Purpose**: Create a new ride
**Request Body**:
```typescript
{
  startLocation: LocationType,
  endLocation: LocationType,
  startTime: string,        // ISO 8601
  endTime: string,          // ISO 8601
  rider: RiderType,
  driver?: DriverType,      // Optional
  type?: Type,              // Defaults to UNSCHEDULED
  status?: Status,          // Defaults to NOT_STARTED
  schedulingState?: SchedulingState, // Auto-determined
  timezone?: string         // Defaults to 'America/New_York'
}
```

**Validation**:
- `startTime` must be in the future
- `endTime` must be after `startTime`
- Required fields: `startTime`, `endTime`, `rider`
- Recurring rides are currently disabled

#### PUT `/api/rides/:id`
**Purpose**: Update an existing ride
**Request Body**: Partial ride object with fields to update

**Auto-updates**:
- `schedulingState` is automatically updated based on driver assignment:
  - If driver is assigned: `SCHEDULED`
  - If driver is removed: `UNSCHEDULED`

**Authorization**: User must be the rider, assigned driver, or admin

#### DELETE `/api/rides/:id`
**Purpose**: Delete or cancel a ride
**Behavior**:
- Active rides are cancelled (status set to `CANCELLED`) instead of deleted
- Non-active rides are permanently deleted
- Recurring rides cannot be deleted (feature disabled)

### Additional Endpoints

#### GET `/api/rides/download`
**Purpose**: Export rides to CSV for a specific date
**Query Parameters**: `date` (YYYY-MM-DD)
**Response**: CSV file with ride data

#### GET `/api/rides/repeating`
**Purpose**: Get all master repeating rides (currently disabled)
**Response**: Array of recurring ride objects

#### PUT `/api/rides/:id/edits`
**Purpose**: Edit recurring ride instances (currently disabled)
**Response**: Error message indicating feature is not supported

## Ride States and Status Flow

### Status Progression

```
NOT_STARTED → ON_THE_WAY → ARRIVED → PICKED_UP → COMPLETED
     ↓              ↓           ↓
  CANCELLED    NO_SHOW    NO_SHOW
```

### Scheduling State Logic

1. **Ride Creation**:
   - If driver is provided: `schedulingState = SCHEDULED`
   - If no driver: `schedulingState = UNSCHEDULED`

2. **Driver Assignment**:
   - When driver is assigned: `schedulingState = SCHEDULED`
   - When driver is removed: `schedulingState = UNSCHEDULED`

3. **Type Determination**:
   - `type = ACTIVE` when driver is assigned
   - `type = UNSCHEDULED` when no driver is assigned

## Frontend Components

### Ride Context (`RidesContext.tsx`)

The frontend uses React Context to manage ride state:

```typescript
type ridesState = {
  unscheduledRides: Ride[];     // Rides without drivers
  scheduledRides: Ride[];       // Rides with drivers
  refreshRides: () => Promise<void>; // Refresh function
};
```

**Key Features**:
- Separates rides by scheduling state
- Provides refresh functionality
- Fetches all rides (not just today's) to show upcoming rides

### Ride Table Components

#### Main Rides Table (`RidesTable.tsx`)
**Purpose**: Display rides in a tabular format with action buttons
**Features**:
- Different layouts for scheduled vs unscheduled rides
- Action buttons: Edit, Assign/Reassign, Delete
- Click-to-view ride details
- Modal integration for actions

**Action Buttons**:
- **Edit**: Opens ride edit modal
- **Assign**: Opens driver assignment modal (for unscheduled rides)
- **Reassign**: Opens driver assignment modal (for scheduled rides)
- **Delete**: Opens delete confirmation modal

#### Enhanced Ride Table (`RideTable.tsx`)
**Purpose**: Modern Material-UI table with advanced features
**Features**:
- Pagination
- Sorting
- Status chips with color coding
- Responsive design
- Click-to-view details

### Ride Detail Components

#### Ride Details Modal (`RideDetailsComponent.tsx`)
**Purpose**: Comprehensive ride information display
**Features**:
- Tabbed interface (Overview, People, Locations)
- Role-based content (different views for rider/driver/admin)
- Action buttons based on user role
- Mobile-responsive design

#### Ride Actions (`RideActions.tsx`)
**Purpose**: Role-based action buttons for ride operations
**Role-specific Actions**:

**Rider Actions**:
- Edit (only for unscheduled rides)
- Cancel (with confirmation)
- Contact Admin

**Driver Actions**:
- Update Status (dropdown with next valid statuses)
- Report Issue

**Admin Actions**:
- Edit
- Cancel
- Actions (placeholder for future features)

## Action Buttons and Functionality

### Driver Assignment (`AssignDriverModal.tsx`)

**Purpose**: Assign or reassign drivers to rides
**Functionality**:
- Lists all available drivers
- Shows driver photos and names
- Updates ride with selected driver
- Automatically sets `schedulingState` to `SCHEDULED`
- Sends notifications to relevant parties

**API Call**:
```typescript
axios.put(`/api/rides/${ride.id}`, {
  driver: selectedDriver,
  type: reassign ? undefined : 'active'
})
```

### Ride Editing (`RideModal.tsx`)

**Purpose**: Create or edit rides
**Features**:
- Multi-step form (Times, Driver, Rider Info)
- Validation for future dates and logical time ordering
- Support for both new rides and edits
- Handles recurring ride logic (currently disabled)

**API Calls**:
- **Create**: `POST /api/rides`
- **Edit**: `PUT /api/rides/${id}`

### Status Updates

**Purpose**: Update ride operational status
**Implementation**: Currently placeholder in `RideActions.tsx`
**Planned Functionality**:
- Dropdown with valid next statuses
- API call to update status
- Notification sending
- Status validation

### Ride Cancellation

**Purpose**: Cancel rides
**Implementation**: Currently placeholder in `RideActions.tsx`
**Planned Functionality**:
- Confirmation dialog
- API call to set status to `CANCELLED`
- Notification to relevant parties
- Different behavior for active vs unscheduled rides

## Notification System

### Notification Flow

The system sends notifications for various ride events:

#### Notification Events
```typescript
export enum Change {
  CREATED = 'created',
  EDITED = 'edited',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
  REASSIGN_DRIVER = 'reassign_driver',
  LATE = 'late',
}
```

#### Notification Receivers (`notificationReceivers.ts`)

**Rider Actions**:
- Edit/Cancel → Notify Admin + Driver (if assigned)

**Driver Actions**:
- Late/No Show → Notify Rider + Admin
- On the Way/Arrived → Notify Rider

**Admin Actions**:
- Create/Edit/Cancel → Notify Rider + Driver (if assigned)

#### Notification Messages (`notificationMsg.ts`)

**Status-based Messages**:
- `ARRIVED`: "Your driver is here! Meet your driver at the pickup point."
- `ON_THE_WAY`: "Your driver is on the way! Wait outside to meet your driver."
- `CANCELLED`: Context-aware cancellation message
- `NO_SHOW`: No-show notification message

#### Notification Delivery

**Platforms Supported**:
- Web Push Notifications
- Mobile Push (Android/iOS via SNS)

**Implementation**:
- Uses AWS SNS for mobile notifications
- Uses Web Push API for browser notifications
- Handles subscription management and cleanup

## Implementation Notes

### Current Limitations

1. **Recurring Rides**: RFC 5545 recurrence functionality is implemented in the schema but disabled in the API
2. **Status Updates**: Status update functionality is placeholder code
3. **Ride Cancellation**: Cancellation functionality is placeholder code
4. **Advanced Filtering**: Limited filtering options in the frontend

### Database Schema

**Primary Key**: `id` (String, UUID)
**Indexes**: DynamoDB automatically indexes the primary key
**Query Patterns**: 
- Scan operations with filters for most queries
- Get by ID for individual ride retrieval

### Security Considerations

1. **Authorization**: Users can only modify rides they're associated with (rider, driver) or if they're admin
2. **Validation**: Server-side validation for all ride data
3. **Time Validation**: Prevents creation of rides in the past
4. **Driver Assignment**: Validates driver availability and assignment

### Performance Considerations

1. **Scan Operations**: Most queries use DynamoDB scan with filters (consider adding GSIs for better performance)
2. **Frontend Caching**: Rides context caches data and provides refresh functionality
3. **Pagination**: Enhanced table supports pagination for large datasets

### Future Enhancements

1. **Recurring Rides**: Implement RFC 5545 recurrence rules
2. **Real-time Updates**: WebSocket integration for live status updates
3. **Advanced Filtering**: More sophisticated filtering and search
4. **Bulk Operations**: Support for bulk ride operations
5. **Analytics**: Ride analytics and reporting features
6. **Mobile App**: Native mobile application support

## API Integration Examples

### Creating a Ride
```typescript
const newRide = {
  startLocation: { id: "loc1", name: "Campus Center", tag: "central" },
  endLocation: { id: "loc2", name: "Library", tag: "central" },
  startTime: "2024-01-15T09:00:00.000Z",
  endTime: "2024-01-15T09:30:00.000Z",
  rider: { id: "rider1", firstName: "John", lastName: "Doe" }
};

const response = await axios.post('/api/rides', newRide);
```

### Assigning a Driver
```typescript
const driver = { id: "driver1", firstName: "Jane", lastName: "Smith" };
await axios.put(`/api/rides/${rideId}`, { driver });
```

### Updating Ride Status
```typescript
await axios.put(`/api/rides/${rideId}`, { 
  status: Status.ON_THE_WAY 
});
```

### Filtering Rides
```typescript
// Get unscheduled rides for today
const response = await axios.get('/api/rides', {
  params: {
    schedulingState: 'unscheduled',
    date: '2024-01-15'
  }
});
```

This documentation provides a comprehensive overview of the ride system's functionality, focusing on backend operations and action button implementations. The system is designed to be extensible and supports the core transportation management needs while providing a foundation for future enhancements.
