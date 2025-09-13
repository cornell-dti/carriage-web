# Server API Reference

## Overview

The Carriage application provides a RESTful API built with Express.js and TypeScript. All endpoints require authentication via JWT tokens, with role-based access control for different user types.

## Base URL

```
/api
```

## Authentication

All endpoints (except `/api/auth` and `/api/health-check`) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Router Structure

The API is organized into the following routers:

- `/api/auth` - Authentication endpoints
- `/api/riders` - Rider management
- `/api/drivers` - Driver management  
- `/api/admins` - Admin management
- `/api/rides` - Ride management
- `/api/locations` - Location management
- `/api/vehicles` - Vehicle management
- `/api/notification` - Notification management
- `/api/stats` - Statistics and analytics
- `/api/favorites` - Favorite rides
- `/api/upload` - File uploads

## Authentication Endpoints

### POST /api/auth
Exchange Google OAuth2 authorization code for JWT token.

**Request Body:**
```json
{
  "code": "google_oauth_authorization_code",
  "table": "Riders|Drivers|Admins"
}
```

**Response:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: User not found, user not active, table not found
- `500`: Server error, OAuth error

### POST /api/auth/dummy (Development Only)
Test authentication without Google OAuth.

**Request Body:**
```json
{
  "email": "test@example.com",
  "table": "Riders|Drivers|Admins"
}
```

## Rider Endpoints

### GET /api/riders
Get all riders.

**Auth Required:** Admin

**Response:**
```json
{
  "data": [
    {
      "id": "rider-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "active": true,
      "joinDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  ]
}
```

### GET /api/riders/:id
Get a specific rider by ID.

**Auth Required:** User

**Response:**
```json
{
  "data": {
    "id": "rider-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "active": true,
    "joinDate": "2024-01-01",
    "endDate": "2024-12-31",
    "address": "123 Main St, Ithaca, NY",
    "favoriteLocations": ["loc-uuid-1", "loc-uuid-2"],
    "accessibility": ["Wheelchair"],
    "organization": "RedRunner"
  }
}
```

### GET /api/riders/:id/profile
Get rider profile information.

**Auth Required:** User

**Response:**
```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "pronouns": "he/him/his",
  "joinDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### GET /api/riders/:id/accessibility
Get rider accessibility information.

**Auth Required:** User

**Response:**
```json
{
  "description": "Uses wheelchair for mobility",
  "accessibility": ["Wheelchair"]
}
```

### GET /api/riders/:id/organization
Get rider organization information.

**Auth Required:** User

**Response:**
```json
{
  "description": "Student organization member",
  "organization": "RedRunner"
}
```

### GET /api/riders/:id/favorites
Get rider's favorite locations.

**Auth Required:** User

**Response:**
```json
{
  "data": [
    {
      "id": "loc-uuid",
      "name": "Central Campus",
      "address": "Central Campus, Ithaca, NY",
      "shortName": "Central",
      "tag": "central",
      "lat": 42.4534,
      "lng": -76.4735
    }
  ]
}
```

### GET /api/riders/:id/currentride
Get rider's current or soonest ride (within next 30 minutes).

**Auth Required:** Rider

**Response:**
```json
{
  "id": "ride-uuid",
  "type": "active",
  "status": "not_started",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T10:30:00.000Z",
  "startLocation": { /* location object */ },
  "endLocation": { /* location object */ },
  "rider": { /* rider object */ },
  "driver": { /* driver object */ }
}
```

### GET /api/riders/:id/usage
Get rider usage statistics.

**Auth Required:** Admin

**Response:**
```json
{
  "studentRides": 15,
  "noShowCount": 2
}
```

### GET /api/riders/usage
Get usage statistics for all riders.

**Auth Required:** Admin

**Response:**
```json
{
  "rider-uuid-1": {
    "noShows": 2,
    "totalRides": 15
  },
  "rider-uuid-2": {
    "noShows": 1,
    "totalRides": 8
  }
}
```

### POST /api/riders
Create a new rider.

**Auth Required:** Admin

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "address": "123 Main St, Ithaca, NY",
  "joinDate": "2024-01-01",
  "endDate": "2024-12-31",
  "accessibility": ["Wheelchair"],
  "organization": "RedRunner"
}
```

**Response:** `201` - Created rider object

### PUT /api/riders/:id
Update a rider.

**Auth Required:** Rider (own profile) or Admin

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "address": "123 Main St, Ithaca, NY",
  "active": true
}
```

**Response:** Updated rider object

### POST /api/riders/:id/favorites
Add a location to rider's favorites.

**Auth Required:** Rider

**Request Body:**
```json
{
  "id": "location-uuid"
}
```

**Response:** Updated favorite locations array

### DELETE /api/riders/:id
Delete a rider.

**Auth Required:** Admin

**Response:** `200` - Success

## Driver Endpoints

### GET /api/drivers
Get all drivers.

**Auth Required:** Admin

**Response:**
```json
{
  "data": [
    {
      "id": "driver-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phoneNumber": "1234567890",
      "availability": ["MON", "TUE", "WED", "THURS", "FRI"],
      "active": true,
      "joinDate": "2024-01-01"
    }
  ]
}
```

### GET /api/drivers/available
Get available drivers for a specific date and time window.

**Auth Required:** User

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format
- `startTime`: Start time in HH:mm format
- `endTime`: End time in HH:mm format
- `timezone`: Timezone (default: America/New_York)

**Example:** `/api/drivers/available?date=2024-01-15&startTime=10:00&endTime=12:00`

**Response:**
```json
{
  "data": [
    {
      "id": "driver-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phoneNumber": "1234567890",
      "availability": ["MON", "TUE", "WED", "THURS", "FRI"],
      "active": true
    }
  ]
}
```

### GET /api/drivers/:id
Get a specific driver by ID.

**Auth Required:** User

**Response:** Driver object

### GET /api/drivers/:id/profile
Get driver profile information.

**Auth Required:** User

**Response:**
```json
{
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "1234567890",
  "photoLink": "https://example.com/photo.jpg"
}
```

### GET /api/drivers/:id/stats
Get driver's weekly statistics.

**Auth Required:** Admin

**Response:** Driver statistics (implementation pending)

### POST /api/drivers
Create a new driver.

**Auth Required:** Admin

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "1234567890",
  "availability": ["MON", "TUE", "WED", "THURS", "FRI"],
  "startDate": "2024-01-01"
}
```

**Response:** `201` - Created driver object

### PUT /api/drivers/:id
Update a driver.

**Auth Required:** Driver (own profile) or Admin

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "1234567890",
  "availability": ["MON", "TUE", "WED", "THURS", "FRI"]
}
```

**Response:** Updated driver object

### DELETE /api/drivers/:id
Delete a driver.

**Auth Required:** Admin

**Response:** `200` - Success

## Admin Endpoints

### GET /api/admins
Get all admins.

**Auth Required:** Admin

**Response:**
```json
{
  "data": [
    {
      "id": "admin-uuid",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "type": ["sds-admin"],
      "isDriver": false,
      "phoneNumber": "1234567890"
    }
  ]
}
```

### GET /api/admins/:id
Get a specific admin by ID.

**Auth Required:** Admin

**Response:** Admin object

### POST /api/admins
Create a new admin.

**Auth Required:** Admin

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "type": ["sds-admin"],
  "isDriver": false,
  "phoneNumber": "1234567890"
}
```

**Response:** `201` - Created admin object

### PUT /api/admins/:id
Update an admin.

**Auth Required:** Admin

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "type": ["sds-admin", "redrunner-admin"],
  "isDriver": true
}
```

**Response:** Updated admin object

### DELETE /api/admins/:id
Delete an admin.

**Auth Required:** Admin

**Response:** `200` - Success

## Ride Endpoints

### GET /api/rides
Get rides with optional filtering.

**Auth Required:** User

**Query Parameters:**
- `type`: Ride type (active, past, unscheduled)
- `status`: Ride status (not_started, on_the_way, arrived, picked_up, completed, no_show, cancelled)
- `rider`: Rider ID
- `driver`: Driver ID
- `date`: Date in YYYY-MM-DD format
- `scheduled`: Legacy parameter (true/false)
- `schedulingState`: Scheduling state (scheduled, unscheduled)

**Response:**
```json
{
  "data": [
    {
      "id": "ride-uuid",
      "type": "active",
      "status": "not_started",
      "schedulingState": "scheduled",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T10:30:00.000Z",
      "startLocation": { /* location object */ },
      "endLocation": { /* location object */ },
      "rider": { /* rider object */ },
      "driver": { /* driver object */ },
      "isRecurring": false,
      "timezone": "America/New_York"
    }
  ]
}
```

### GET /api/rides/:id
Get a specific ride by ID.

**Auth Required:** User

**Response:** Ride object

### GET /api/rides/rider/:id
Get all rides for a specific rider.

**Auth Required:** User

**Response:** Array of ride objects

### GET /api/rides/repeating
Get all master repeating rides.

**Auth Required:** User

**Query Parameters:**
- `rider`: Optional rider ID filter

**Response:** Array of repeating ride objects

### GET /api/rides/download
Download rides data as CSV for a specific date.

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format

**Response:** CSV file download

### POST /api/rides
Create a new ride.

**Auth Required:** User

**Request Body:**
```json
{
  "startLocation": {
    "id": "loc-uuid",
    "name": "Central Campus",
    "address": "Central Campus, Ithaca, NY",
    "lat": 42.4534,
    "lng": -76.4735
  },
  "endLocation": {
    "id": "loc-uuid-2",
    "name": "North Campus",
    "address": "North Campus, Ithaca, NY",
    "lat": 42.4534,
    "lng": -76.4735
  },
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T10:30:00.000Z",
  "rider": {
    "id": "rider-uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "driver": {
    "id": "driver-uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "type": "active",
  "schedulingState": "scheduled",
  "timezone": "America/New_York"
}
```

**Response:** `201` - Created ride object

### PUT /api/rides/:id
Update an existing ride.

**Auth Required:** User (ride owner, assigned driver, or admin)

**Request Body:**
```json
{
  "status": "on_the_way",
  "driver": {
    "id": "driver-uuid",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

**Response:** Updated ride object

### PUT /api/rides/:id/edits
Update recurring ride edits (currently disabled).

**Auth Required:** User

**Response:** `400` - Recurring ride edits not supported yet

### DELETE /api/rides/:id
Delete or cancel a ride.

**Auth Required:** User (ride owner, assigned driver, or admin)

**Response:** 
- For active rides: Cancelled ride object
- For non-active rides: `{ "id": "ride-uuid" }`

## Location Endpoints

### GET /api/locations
Get all locations with optional filtering.

**Auth Required:** User

**Query Parameters:**
- `active`: Filter by active status (true/false)

**Response:**
```json
{
  "data": [
    {
      "id": "loc-uuid",
      "name": "Central Campus",
      "address": "Central Campus, Ithaca, NY",
      "shortName": "Central",
      "info": "Main campus area",
      "tag": "central",
      "lat": 42.4534,
      "lng": -76.4735,
      "photoLink": "https://example.com/photo.jpg",
      "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
    }
  ]
}
```

### GET /api/locations/:id
Get a specific location by ID.

**Auth Required:** User

**Response:** Location object

### POST /api/locations
Create a new location.

**Auth Required:** Admin

**Request Body:**
```json
{
  "name": "Central Campus",
  "address": "Central Campus, Ithaca, NY",
  "shortName": "Central",
  "info": "Main campus area",
  "tag": "central",
  "lat": 42.4534,
  "lng": -76.4735
}
```

**Response:** `201` - Created location object

### PUT /api/locations/:id
Update a location.

**Auth Required:** Admin

**Request Body:**
```json
{
  "name": "Updated Campus Name",
  "info": "Updated description"
}
```

**Response:** Updated location object

### DELETE /api/locations/:id
Delete a location.

**Auth Required:** Admin

**Response:** `200` - Success

## Vehicle Endpoints

### GET /api/vehicles
Get all vehicles.

**Auth Required:** Admin

**Response:**
```json
{
  "data": [
    {
      "id": "vehicle-uuid",
      "name": "Van 1",
      "capacity": 8
    }
  ]
}
```

### GET /api/vehicles/:id
Get a specific vehicle by ID.

**Auth Required:** User

**Response:** Vehicle object

### POST /api/vehicles
Create a new vehicle.

**Auth Required:** Admin

**Request Body:**
```json
{
  "name": "Van 1",
  "capacity": 8
}
```

**Response:** `201` - Created vehicle object

### PUT /api/vehicles/:id
Update a vehicle.

**Auth Required:** Admin

**Request Body:**
```json
{
  "name": "Updated Van Name",
  "capacity": 10
}
```

**Response:** Updated vehicle object

### DELETE /api/vehicles/:id
Delete a vehicle.

**Auth Required:** Admin

**Response:** `200` - Success

## Notification Endpoints

### POST /api/notification/subscribe
Subscribe a user to push notifications.

**Auth Required:** User

**Request Body:**
```json
{
  "platform": "web|android",
  "userType": "Admin|Rider|Driver",
  "userId": "user-uuid",
  "webSub": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key",
      "auth": "auth"
    }
  }
}
```

**Response:**
```json
{
  "success": true
}
```

## Statistics Endpoints

### GET /api/stats
Get statistics for a date range.

**Auth Required:** Admin

**Query Parameters:**
- `from`: Start date in YYYY-MM-DD format
- `to`: End date in YYYY-MM-DD format

**Response:**
```json
{
  "data": [
    {
      "year": "2024",
      "monthDay": "0115",
      "dayCount": 25,
      "dayNoShow": 2,
      "dayCancel": 1,
      "nightCount": 15,
      "nightNoShow": 1,
      "nightCancel": 0,
      "drivers": {
        "Jane Smith": 20,
        "John Doe": 15
      }
    }
  ]
}
```

### GET /api/stats/download
Download statistics as CSV for a date range.

**Auth Required:** Admin

**Query Parameters:**
- `from`: Start date in YYYY-MM-DD format
- `to`: End date in YYYY-MM-DD format

**Response:** CSV file download

### PUT /api/stats
Update statistics for specific dates.

**Auth Required:** Admin

**Request Body:**
```json
{
  "dates": {
    "01/15/2024": {
      "dayCount": 25,
      "dayNoShow": 2,
      "dayCancel": 1,
      "nightCount": 15,
      "nightNoShow": 1,
      "nightCancel": 0,
      "drivers": {
        "Jane Smith": 20,
        "John Doe": 15
      }
    }
  }
}
```

**Response:** Updated statistics objects

## Favorites Endpoints

### GET /api/favorites
Get all favorite rides for the current user.

**Auth Required:** User

**Response:**
```json
{
  "data": [
    {
      "id": "ride-uuid",
      "type": "past",
      "status": "completed",
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T10:30:00.000Z",
      "startLocation": { /* location object */ },
      "endLocation": { /* location object */ },
      "rider": { /* rider object */ },
      "driver": { /* driver object */ }
    }
  ]
}
```

### GET /api/favorites/:rideId
Check if a ride is favorited and get its data.

**Auth Required:** User

**Response:** Ride object if favorited

### POST /api/favorites
Add a ride to favorites.

**Auth Required:** User

**Request Body:**
```json
{
  "rideId": "ride-uuid"
}
```

**Response:** Favorite object

### DELETE /api/favorites/:rideId
Remove a ride from favorites.

**Auth Required:** User

**Response:** `200` - Success

## Upload Endpoints

### POST /api/upload
Upload images to S3 and update database records.

**Auth Required:** User

**Request Body:**
```json
{
  "id": "user-uuid",
  "tableName": "Drivers|Admins|Riders|Locations",
  "fileBuffer": "base64-encoded-image",
  "fileBuffers": ["base64-encoded-image-1", "base64-encoded-image-2"]
}
```

**Response:**
- Single image: Updated record with photoLink
- Multiple images: Array of uploaded URLs

## Health Check

### GET /api/health-check
Check server health.

**Auth Required:** None

**Response:** `200` - "OK"

## Error Responses

All endpoints return consistent error responses:

```json
{
  "err": "Error message description"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors, missing fields)
- `401`: Unauthorized (invalid or missing JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Error Examples

```json
{
  "err": "User not found"
}
```

```json
{
  "err": "User ID does not match request ID"
}
```

```json
{
  "err": "Missing required fields: startTime, endTime, and rider are required"
}
```

## Pagination and Filtering

### Query Parameters
Most list endpoints support filtering via query parameters:

- **Date filtering**: Use `date` parameter with YYYY-MM-DD format
- **Status filtering**: Use `status` parameter with enum values
- **User filtering**: Use `rider` or `driver` parameters with user IDs
- **Type filtering**: Use `type` parameter with enum values

### Response Format
All list endpoints return data in the following format:

```json
{
  "data": [
    // Array of objects
  ]
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is enabled for all origins. Configure specific origins for production use.
