# Driver Operations Workflow

## Overview

The driver operations workflow covers how drivers interact with the system to view assigned rides, update ride status, manage their availability, and track their performance. This workflow focuses on the driver's day-to-day operations and their interface with the ride management system.

## Driver Data Model

### Driver Schema

**File**: `server/src/models/driver.ts`

```typescript
interface DriverType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  availability: DayOfWeek[]; // MON, TUE, WED, THURS, FRI, SAT, SUN
  joinDate: string;
  active: boolean;
  photoLink?: string;
}
```

**Key Fields**:
- **availability**: Array of days the driver is available to work
- **active**: Boolean flag indicating if driver is currently active
- **joinDate**: When the driver joined the system
- **photoLink**: Optional profile picture URL

## Driver Interface Structure

### Driver Routes

**File**: `frontend/src/pages/Driver/Routes.tsx`

The driver interface is organized into three main sections:

1. **Rides** (`/rides`): Main dashboard for viewing and managing assigned rides
2. **Settings** (`/settings`): Driver profile and availability management
3. **Reports** (`/reports`): Performance metrics and ride statistics

**Context Providers**:
- `DateContext`: Manages current date for ride filtering
- `RidesProvider`: Provides ride data and refresh functionality
- `LocationsProvider`: Provides location data for ride details

## Ride Management

### Main Rides Dashboard

**File**: `frontend/src/pages/Driver/Rides.tsx`

The rides dashboard provides drivers with:

#### Current Ride Card
- **Real-time Status**: Shows the currently active ride
- **Trip Information**: Distance and duration calculations via Google Maps
- **Navigation**: Direct links to Google Maps for pickup/dropoff locations
- **Status Updates**: Quick status update buttons
- **Contact Information**: Rider contact details

#### Next Ride Card
- **Upcoming Ride**: Shows the next scheduled ride
- **Read-only View**: No status updates for future rides
- **Trip Planning**: Distance and duration for planning

#### Ride Table
- **All Assigned Rides**: Complete list of rides assigned to the driver
- **Status Tracking**: Visual status indicators with color coding
- **Export Options**: Export ride data and send email reports

### Ride Status Management

#### Status Update Flow

**Status Progression**:
```
NOT_STARTED → ON_THE_WAY → ARRIVED → PICKED_UP → COMPLETED
```

**Status Colors**:
- `NOT_STARTED`: Default (gray)
- `ON_THE_WAY`: Primary (blue)
- `ARRIVED`: Info (light blue)
- `PICKED_UP`: Warning (orange)
- `COMPLETED`: Success (green)
- `NO_SHOW`/`CANCELLED`: Error (red)

#### UpdateStatusModal

**File**: `frontend/src/components/UpdateStatusModal/UpdateStatusModal.tsx`

A modal dialog that allows drivers to update ride status:

- **Current Status Display**: Shows the current ride status
- **Next Status Options**: Lists valid next statuses based on current state
- **One-click Updates**: Simple selection interface
- **Loading States**: Prevents multiple simultaneous updates

#### Status Update API

**Endpoint**: `PUT /api/rides/{id}`

**Request Body**:
```typescript
{
  status: Status;
}
```

**Processing**:
1. Validates driver permissions (driver must be assigned to the ride)
2. Updates ride status in database
3. Sends notifications to relevant parties
4. Returns updated ride object

### Navigation and Contact

#### Google Maps Integration

**Features**:
- **Directions**: Direct links to Google Maps with pre-filled addresses
- **Trip Planning**: Real-time distance and duration calculations
- **Location Details**: Full address information for pickup/dropoff

**Navigation Logic**:
- **Before Pickup**: Navigate to pickup location
- **After Pickup**: Navigate to dropoff location
- **Completed Rides**: No navigation available

#### Contact Information

**Rider Contact**:
- **Phone**: Direct phone call links
- **Email**: Email contact options
- **Contact Modal**: Detailed contact information display

## Driver Availability Management

### Availability System

**Availability Days**:
- `MON`, `TUE`, `WED`, `THURS`, `FRI`, `SAT`, `SUN`
- Drivers can be available on multiple days
- Availability is checked when assigning rides

### Available Drivers API

**Endpoint**: `GET /api/drivers/available`

**Query Parameters**:
- `date`: Date to check availability (YYYY-MM-DD)
- `startTime`: Start time (HH:mm)
- `endTime`: End time (HH:mm)
- `timezone`: Timezone (default: America/New_York)

**Processing Logic**:
1. **Active Drivers**: Filters out inactive drivers
2. **Day Availability**: Checks if driver is available on the requested day
3. **Conflict Detection**: Scans existing rides for time conflicts
4. **Time Overlap**: Ensures no overlapping ride assignments

**Response**:
```typescript
{
  data: DriverType[];
}
```

## Performance Tracking

### Reports Dashboard

**File**: `frontend/src/pages/Driver/Reports.tsx`

The reports section provides drivers with performance metrics:

#### Key Metrics
- **Completed Rides**: Total number of completed rides
- **Total Minutes**: Total time spent driving
- **Average Duration**: Average ride duration in minutes
- **Daily Breakdown**: Rides completed by day

#### Data Calculation
```typescript
const totals = {
  count: completedRides.length,
  totalMinutes: sumOfAllRideDurations,
  avgMinutes: totalMinutes / count,
  byDay: ridesGroupedByDate
};
```

#### Ride Duration Calculation
```typescript
const minutes = (new Date(ride.endTime).getTime() - new Date(ride.startTime).getTime()) / 60000;
```

## Driver Settings

### Profile Management

**File**: `frontend/src/pages/Driver/Settings.tsx`

The settings page allows drivers to:

- **View Profile**: Display personal information
- **Contact Information**: Phone and email details
- **Availability**: View current availability settings
- **Photo**: Profile picture display

**Profile Information**:
- First and last name
- Net ID (derived from email)
- Phone number
- Email address
- Join date
- Availability schedule

## Notification System

### Driver Notifications

**Notification Events**:
- **Status Updates**: Notifications sent to riders when driver updates status
- **Ride Assignments**: Notifications when assigned to new rides
- **Ride Changes**: Notifications when ride details are modified

**Notification Recipients**:
- **ON_THE_WAY**: Notifies rider
- **ARRIVED**: Notifies rider
- **LATE**: Notifies rider and admin
- **NO_SHOW**: Notifies rider and admin

### Notification Messages

**Status-based Messages**:
- `ON_THE_WAY`: "Your driver is on the way! Wait outside to meet your driver."
- `ARRIVED`: "Your driver is here! Meet your driver at the pickup point."
- `LATE`: Late notification with context
- `NO_SHOW`: No-show notification with details

## API Endpoints

### Driver Management

#### Get All Drivers
- **Endpoint**: `GET /api/drivers`
- **Auth**: Admin only
- **Response**: Array of all drivers

#### Get Driver by ID
- **Endpoint**: `GET /api/drivers/{id}`
- **Auth**: Any authenticated user
- **Response**: Single driver object

#### Get Driver Profile
- **Endpoint**: `GET /api/drivers/{id}/profile`
- **Auth**: Any authenticated user
- **Response**: Public driver information (name, contact, photo)

#### Update Driver
- **Endpoint**: `PUT /api/drivers/{id}`
- **Auth**: Driver (own profile) or Admin
- **Request**: Partial driver object
- **Response**: Updated driver object

#### Create Driver
- **Endpoint**: `POST /api/drivers`
- **Auth**: Admin only
- **Request**: Complete driver object
- **Response**: Created driver object

#### Delete Driver
- **Endpoint**: `DELETE /api/drivers/{id}`
- **Auth**: Admin only
- **Response**: Success confirmation

### Ride Management

#### Update Ride Status
- **Endpoint**: `PUT /api/rides/{id}`
- **Auth**: Driver (assigned to ride) or Admin
- **Request**: `{ status: Status }`
- **Response**: Updated ride object

## Error Handling

### Client-Side Errors

- **Status Update Failures**: Alert messages for failed updates
- **Network Errors**: Handled by axios interceptors
- **Permission Errors**: 403 Forbidden responses

### Server-Side Errors

- **Validation Errors**: 400 Bad Request with error details
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 for non-existent resources

## Current Limitations

1. **Recurring Rides**: Not fully supported in driver operations
2. **Real-time Updates**: No WebSocket connections for live updates
3. **Offline Support**: No offline capability for status updates
4. **Bulk Operations**: No bulk status updates for multiple rides
5. **Advanced Scheduling**: Limited scheduling conflict resolution

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live status updates
2. **Offline Support**: Offline status updates with sync
3. **Advanced Navigation**: In-app navigation with turn-by-turn directions
4. **Performance Analytics**: More detailed performance metrics
5. **Availability Management**: Self-service availability updates
6. **Bulk Operations**: Multiple ride status updates
7. **Push Notifications**: Mobile push notifications for ride assignments

## Related Components

- **RideDetailCard**: Individual ride display component
- **UpdateStatusModal**: Status update interface
- **ContactInfoModal**: Rider contact information
- **RideTable**: Tabular ride display
- **UserDetail**: Profile management component
- **Notification**: Notification display component

## Dependencies

- **Google Maps API**: Navigation and trip planning
- **Material-UI**: UI components and styling
- **React Context**: State management
- **Axios**: API communication
- **Moment.js**: Date/time handling
