# Rider Experience Workflow

## Overview

The rider experience workflow covers how riders interact with the system to request rides, view their schedule, track ride status, and manage their preferences. This workflow focuses on the rider's journey from initial ride request through completion, including all user-facing interactions and notifications.

## Rider Interface Structure

### Rider Routes

**File**: `frontend/src/pages/Rider/Routes.tsx`

The rider interface is organized into two main sections:

1. **Schedule** (`/schedule`): Main dashboard for viewing rides and requesting new ones
2. **Settings** (`/settings`): Rider profile and notification preferences

**Context Providers**:
- `DateContext`: Manages current date for ride filtering
- `RidesProvider`: Provides ride data and refresh functionality
- `LocationsProvider`: Provides location data for ride requests

## Main Schedule Dashboard

### Schedule Page

**File**: `frontend/src/pages/Rider/Schedule.tsx`

The schedule page is the primary interface for riders, providing:

#### Main Card Section
- **Current/Next Ride Display**: Shows the most relevant upcoming ride
- **Ride Details**: Date, time, pickup/dropoff locations
- **Driver Information**: Contact details and photo (if assigned)
- **Status Tracking**: Real-time ride status updates
- **Action Buttons**: Edit, cancel, and contact options

#### Favorites Card
- **Quick Access**: Saved favorite ride configurations
- **One-click Requests**: Quick ride request from favorites
- **Add New Favorites**: Easy addition of new favorite routes

#### Ride Table
- **Complete History**: All rides (current, upcoming, and past)
- **Status Overview**: Visual status indicators
- **Detailed Information**: Full ride details and history

### MainCard Component

**File**: `frontend/src/components/RiderComponents/MainCard.tsx`

The main card displays the most important ride information:

#### Ride Information Display
- **Date and Time**: Formatted pickup time
- **Locations**: Pickup and dropoff details
- **Driver Details**: Name, phone, email, and photo
- **Status**: Current ride status with visual indicators

#### Action Buttons
- **Edit**: Modify ride details (unscheduled rides only)
- **Cancel**: Cancel ride request
- **Contact**: Direct communication with driver
- **Admin Contact**: For scheduled rides that need admin intervention

#### Conditional Logic
- **Unscheduled Rides**: Full edit/cancel capabilities
- **Scheduled Rides**: Admin contact required for changes
- **Current vs Next**: Different display based on ride timing

### FavoritesCard Component

**File**: `frontend/src/components/RiderComponents/FavoritesCard.tsx`

The favorites card provides quick access to common ride patterns:

#### Favorite Ride Structure
```typescript
interface FavoriteRide {
  id: string;
  name: string;
  startLocation: { name: string; address?: string; tag?: string; };
  endLocation: { name: string; address?: string; tag?: string; };
  preferredTime: string;
}
```

#### Features
- **Quick Request**: One-click ride request from favorites
- **Add New**: Easy addition of new favorite routes
- **Empty State**: Guidance when no favorites exist

## Ride Request Process

### Request Ride Dialog

**File**: `frontend/src/components/RiderComponents/RequestRideDialog.tsx`

The ride request process includes:

#### Location Selection
- **Interactive Map**: Visual location selection with Google Maps
- **Dropdown Fallback**: Traditional dropdown selection
- **Custom Locations**: Support for "Other" addresses
- **Step-by-step Flow**: Pickup → Dropoff → Complete

#### Date and Time Selection
- **Date Picker**: Weekday validation and advance notice requirements
- **Time Picker**: Operational hours validation (7:45 AM - 10:00 PM)
- **Recurring Options**: Daily, weekly, and custom patterns (currently blocked)

#### Form Validation
- **Required Fields**: All essential information must be provided
- **Date Validation**: Weekdays only, sufficient advance notice
- **Time Validation**: Within operational hours, logical time progression
- **Location Validation**: Different pickup and dropoff locations

### Ride Creation API

**Endpoint**: `POST /api/rides`

**Request Body**:
```typescript
{
  startLocation: string; // Location ID
  endLocation: string;   // Location ID
  startTime: string;     // ISO format
  endTime: string;       // ISO format
  rider: string;         // User ID
  type: 'unscheduled';
  status: 'not_started';
  schedulingState: 'unscheduled';
}
```

**Processing**:
1. Validates user authentication
2. Creates new ride record
3. Sets initial status and scheduling state
4. Sends notifications to relevant parties

## Ride Status Tracking

### Status Progression

**Ride Status Flow**:
```
NOT_STARTED → ON_THE_WAY → ARRIVED → PICKED_UP → COMPLETED
```

**Status Meanings**:
- `NOT_STARTED`: Ride requested but not yet begun
- `ON_THE_WAY`: Driver is en route to pickup location
- `ARRIVED`: Driver has arrived at pickup location
- `PICKED_UP`: Rider has been picked up
- `COMPLETED`: Ride has been completed
- `CANCELLED`: Ride has been cancelled
- `NO_SHOW`: Rider did not show up for pickup

### Real-time Updates

**Notification System**:
- **Web Push**: Browser notifications for status updates
- **Mobile Push**: SNS notifications for mobile apps
- **In-app Updates**: Real-time status display in interface

**Notification Events**:
- `ON_THE_WAY`: "Your driver is on the way! Wait outside to meet your driver."
- `ARRIVED`: "Your driver is here! Meet your driver at the pickup point."
- `CANCELLED`: Context-aware cancellation message
- `NO_SHOW`: No-show notification message

## Ride Management

### Edit and Cancel Policies

#### Unscheduled Rides
- **Full Control**: Riders can edit or cancel freely
- **Immediate Effect**: Changes take effect immediately
- **No Restrictions**: No advance notice requirements

#### Scheduled Rides
- **Admin Contact Required**: Must contact administrator for changes
- **Driver Assignment**: Cannot modify rides with assigned drivers
- **Business Rules**: Follows institutional policies

#### Cancellation Logic
```typescript
const dayBefore10AM = setSeconds(
  setMinutes(setHours(subDays(new Date(ride.startTime), 1), 10), 0),
  0
);
const now = new Date();
if (!isBefore(now, dayBefore10AM)) {
  // Show cancellation restrictions
}
```

### Ride History and Filtering

#### Ride Categories
- **Current Rides**: Rides happening now
- **Upcoming Rides**: Future scheduled rides
- **Past Rides**: Completed or cancelled rides

#### Filtering Logic
```typescript
const currRides = allRides.filter((ride) => {
  const rideEndDate = ride.endTime.split('T')[0];
  const isCurrent = ride.endTime >= now;
  return isCurrent;
});
```

## Notification System

### Notification Preferences

**File**: `frontend/src/pages/Rider/Settings.tsx`

Riders can configure notification preferences:

#### Notification Types
- **Ride Request Confirmed**: When ride is scheduled
- **Ride Info Cancelled/Edited**: When ride details change
- **Driver Updates**: Status updates from driver

#### Email Preferences
- **Ride Confirmation**: Email confirmations
- **Ride Information Edited**: Change notifications
- **Ride Cancelled**: Cancellation notifications

### Notification Delivery

#### Web Push Notifications
- **Browser Support**: Modern browser push API
- **Subscription Management**: Automatic subscription handling
- **Payload Structure**: Rich notification content

#### Mobile Push Notifications
- **AWS SNS**: Mobile push delivery
- **Platform Support**: Android and iOS
- **Message Formatting**: Platform-specific formatting

## Rider Settings

### Profile Management

**File**: `frontend/src/pages/Rider/Settings.tsx`

The settings page allows riders to:

#### Profile Information
- **Personal Details**: Name, email, phone
- **Net ID**: Derived from email address
- **Photo**: Profile picture display
- **Contact Information**: Phone and email details

#### Notification Settings
- **Push Notifications**: Web and mobile notification preferences
- **Email Notifications**: Email-based notification settings
- **Frequency Control**: Granular notification control

## API Endpoints

### Ride Management

#### Get Rider's Rides
- **Endpoint**: `GET /api/rides?rider={id}`
- **Auth**: Rider (own rides) or Admin
- **Response**: Array of rider's rides

#### Create Ride
- **Endpoint**: `POST /api/rides`
- **Auth**: Any authenticated user
- **Request**: Complete ride object
- **Response**: Created ride object

#### Update Ride
- **Endpoint**: `PUT /api/rides/{id}`
- **Auth**: Rider (own rides) or Admin
- **Request**: Partial ride object
- **Response**: Updated ride object

### Favorites Management

#### Get Favorites
- **Endpoint**: `GET /api/favorites`
- **Auth**: Rider (own favorites)
- **Response**: Array of favorite rides

#### Create Favorite
- **Endpoint**: `POST /api/favorites`
- **Auth**: Rider
- **Request**: Favorite ride object
- **Response**: Created favorite object

## Error Handling

### Client-Side Errors

- **Form Validation**: Inline error messages for form fields
- **API Errors**: Toast notifications for failed requests
- **Network Errors**: Handled by axios interceptors
- **Permission Errors**: Clear messaging for access restrictions

### Server-Side Errors

- **Validation Errors**: 400 Bad Request with specific error details
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 for non-existent resources

## Current Limitations

1. **Recurring Rides**: Currently blocked with alert message
2. **Real-time Updates**: No WebSocket connections for live updates
3. **Offline Support**: No offline capability for ride requests
4. **Advanced Scheduling**: Limited scheduling conflict resolution
5. **Bulk Operations**: No bulk ride management

## Future Enhancements

1. **Recurring Ride Support**: Full implementation of recurring ride logic
2. **Real-time Updates**: WebSocket integration for live status updates
3. **Offline Support**: Offline ride requests with sync
4. **Advanced Notifications**: Rich notification content and scheduling
5. **Ride Sharing**: Carpooling and ride sharing features
6. **Predictive Scheduling**: AI-powered ride scheduling suggestions
7. **Mobile App**: Native mobile application
8. **Integration**: Calendar and calendar app integration

## Related Components

- **RequestRideDialog**: Ride request interface
- **MainCard**: Primary ride display
- **FavoritesCard**: Favorite rides management
- **RideTable**: Tabular ride display
- **Notification**: Notification display component
- **UserDetail**: Profile management component

## Dependencies

- **Google Maps API**: Location selection and mapping
- **Material-UI**: UI components and styling
- **React Context**: State management
- **Axios**: API communication
- **Moment.js**: Date/time handling
- **Date-fns**: Date manipulation utilities
