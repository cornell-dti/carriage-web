# Booking & Requests Workflow

## Overview

The booking and requests workflow handles how riders request rides, including form validation, location selection, and server-side processing. This workflow covers both single rides and recurring rides (though recurring rides are currently blocked in the implementation).

## Components

### RequestRideDialog

**File**: `frontend/src/components/RiderComponents/RequestRideDialog.tsx`

A comprehensive dialog component for riders to request or edit rides. Features include:

- **Location Selection**: Interactive map-based selection with confirmation dialogs
- **Form Validation**: Client-side validation for dates, times, and locations
- **Recurring Options**: Support for daily, weekly, and custom recurring patterns
- **Edit Mode**: Pre-populates form with existing ride data

**Key Features**:
- Step-by-step location selection (pickup → dropoff → complete)
- Visual progress indicators
- Map integration with Google Maps API
- Dropdown fallback for location selection
- Date/time pickers with validation
- Recurring ride configuration

**Form Data Structure**:
```typescript
interface FormData {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  date: Date | null;
  time: Date | null;
  repeatType: 'none' | 'daily' | 'weekly' | 'custom';
  repeatEndDate: Date | null;
  selectedDays: string[];
}
```

### CreateOrEditRideModal

**File**: `frontend/src/components/RequestRideModal/CreateOrEditRideModal.tsx`

A modal wrapper that handles the submission logic for ride creation and editing. Features include:

- **Form Management**: Uses `react-hook-form` for form state management
- **Data Processing**: Cleans null fields and formats data for API submission
- **API Integration**: Makes POST/PUT requests to `/api/rides`
- **Recurring Ride Blocking**: Currently blocks recurring rides with alert

**Modal Types**:
- `CREATE`: New ride creation
- `EDIT_REGULAR`: Edit single ride
- `EDIT_SINGLE_RECURRING`: Edit single instance of recurring ride
- `EDIT_ALL_RECURRING`: Edit all instances of recurring ride

### RequestRideInfo

**File**: `frontend/src/components/RequestRideModal/RequestRideInfo.tsx`

The core form component that renders all ride request fields. Features include:

- **Date/Time Validation**: Ensures rides are scheduled for weekdays with sufficient advance notice
- **Location Selection**: Dropdown selection with custom address support
- **Map Integration**: Visual location selection with `RequestRideMap`
- **Custom Addresses**: Support for "Other" locations with address parsing
- **Recurring Configuration**: Custom day selection for recurring rides

**Validation Rules**:
- Dates must be weekdays (Monday-Friday)
- Rides must be scheduled at least 1-2 days in advance
- Pickup time must be between 7:45 AM and 10:00 PM
- Dropoff time must be after pickup time
- Pickup and dropoff locations must be different

## Workflow Steps

### 1. Ride Request Initiation

1. Rider clicks "Request Ride" button
2. `RequestRideDialog` opens with empty form
3. Location selection begins (pickup first)

### 2. Location Selection

1. **Pickup Selection**:
   - Rider selects pickup location via map or dropdown
   - Confirmation dialog shows location details
   - Selection state advances to dropoff

2. **Dropoff Selection**:
   - Rider selects dropoff location (excluding pickup location)
   - Confirmation dialog shows location details
   - Selection state advances to complete

3. **Custom Locations**:
   - If "Other" is selected, custom address fields appear
   - Address parsing using `addresser` library
   - City defaults to "Ithaca", zip codes default to "14853"/"14850"

### 3. Date and Time Selection

1. **Date Selection**:
   - Date picker with weekday validation
   - Minimum advance notice validation (1-2 days)
   - Weekend blocking

2. **Time Selection**:
   - Pickup time: 7:45 AM - 10:00 PM
   - Dropoff time: Must be after pickup time
   - Time picker with validation

### 4. Recurring Options (Currently Blocked)

1. **Repeat Types**:
   - None (single ride)
   - Daily
   - Weekly
   - Custom (specific days)

2. **Custom Day Selection**:
   - Toggle buttons for Monday-Friday
   - End date selection for recurring rides

### 5. Form Submission

1. **Validation**:
   - All required fields completed
   - Date/time validation passed
   - Location validation passed
   - Recurring options validated (if applicable)

2. **Data Processing**:
   - Form data cleaned (null fields removed)
   - Times converted to ISO format
   - Custom addresses formatted
   - Ride type set to 'unscheduled'

3. **API Call**:
   - POST to `/api/rides` for new rides
   - PUT to `/api/rides/{id}` for edits
   - PUT to `/api/rides/{id}/edits` for recurring ride edits

## Server-Side Processing

### Ride Creation Endpoint

**Route**: `POST /api/rides`

**Request Body**:
```typescript
{
  startLocation: string;
  endLocation: string;
  rider: string; // User ID
  startTime: string; // ISO format
  endTime: string; // ISO format
  isRecurring: boolean;
  timezone: string;
  type: 'unscheduled';
}
```

**Processing**:
1. Validates user authentication
2. Creates new ride record in DynamoDB
3. Sets initial status and scheduling state
4. Sends notifications to relevant users

### Ride Editing Endpoint

**Route**: `PUT /api/rides/{id}`

**Request Body**: Same as creation, plus:
```typescript
{
  deleteOnly?: boolean; // For recurring ride edits
  origDate?: string; // Original date for recurring rides
}
```

**Processing**:
1. Validates user permissions
2. Updates ride record
3. Handles recurring ride logic
4. Sends update notifications

## Validation Rules

### Client-Side Validation

- **Date Validation**:
  - Must be weekday (Monday-Friday)
  - Must be at least 1-2 days in advance
  - Cannot be in the past

- **Time Validation**:
  - Pickup: 7:45 AM - 10:00 PM
  - Dropoff: After pickup time
  - Within operational hours

- **Location Validation**:
  - Pickup and dropoff must be different
  - Custom addresses must include city and zip
  - Locations must be valid

- **Recurring Validation**:
  - End date must be after start date
  - Custom days must be selected
  - Repeat type must be specified

### Server-Side Validation

- **Authentication**: User must be logged in
- **Authorization**: User can only edit their own rides
- **Data Integrity**: All required fields present
- **Business Rules**: Ride scheduling constraints
- **Recurring Logic**: Proper handling of recurring ride instances

## Error Handling

### Client-Side Errors

- **Form Validation Errors**: Displayed inline with form fields
- **API Errors**: Shown via toast notifications
- **Network Errors**: Handled by axios interceptors

### Server-Side Errors

- **Validation Errors**: Returned with appropriate HTTP status codes
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 for non-existent rides
- **Server Errors**: 500 Internal Server Error

## Current Limitations

1. **Recurring Rides**: Currently blocked with alert message
2. **Custom Locations**: Limited to Ithaca area
3. **Time Zones**: Hardcoded to 'America/New_York'
4. **Advance Notice**: Fixed 1-2 day minimum
5. **Operational Hours**: Fixed 7:45 AM - 10:00 PM

## Future Enhancements

1. **Recurring Ride Support**: Full implementation of recurring ride logic
2. **Dynamic Scheduling**: Configurable advance notice and operational hours
3. **Location Expansion**: Support for broader geographic areas
4. **Real-time Validation**: Server-side validation feedback
5. **Bulk Operations**: Support for multiple ride requests
6. **Template System**: Save and reuse common ride patterns

## Related Components

- **RequestRideMap**: Map component for location selection
- **CustomRepeatingRides**: Recurring ride configuration
- **FormElements**: Reusable form components
- **Modal**: Generic modal wrapper
- **ToastContext**: Error and success notifications

## API Dependencies

- **Google Maps API**: Location selection and mapping
- **Moment.js**: Date/time handling and validation
- **Addresser**: Address parsing for custom locations
- **React Hook Form**: Form state management and validation
- **Material-UI**: Form components and date/time pickers
