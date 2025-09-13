# Data Flow and Model Usage

## Overview

This document describes how data models are created, updated, and queried through the API routers and services.

## Model Creation Patterns

### User Models (Rider, Driver, Admin)

#### Creation Flow
```
POST /api/riders
POST /api/drivers  
POST /api/admins
```

#### Data Flow
1. **Request Validation**: Validate required fields and formats
2. **Model Creation**: Create new DynamoDB document
3. **Response**: Return created user data

#### Example: Rider Creation
```typescript
// POST /api/riders
const newRider = new Rider({
  id: uuid(),
  firstName: req.body.firstName,
  lastName: req.body.lastName,
  email: req.body.email,
  phoneNumber: req.body.phoneNumber,
  address: req.body.address,
  joinDate: req.body.joinDate,
  endDate: req.body.endDate,
  active: true
});

await newRider.save();
```

### Ride Model

#### Creation Flow
```
POST /api/rides
```

#### Data Flow
1. **Location Resolution**: Resolve start/end location IDs to full objects
2. **User Resolution**: Resolve rider ID to full rider object
3. **Driver Assignment**: Optional driver assignment
4. **Model Creation**: Create ride with embedded objects
5. **Response**: Return created ride data

#### Example: Ride Creation
```typescript
// POST /api/rides
const startLocation = await Location.get(req.body.startLocationId);
const endLocation = await Location.get(req.body.endLocationId);
const rider = await Rider.get(req.body.riderId);

const newRide = new Ride({
  id: uuid(),
  type: Type.UNSCHEDULED,
  status: Status.NOT_STARTED,
  schedulingState: SchedulingState.UNSCHEDULED,
  startLocation: startLocation,
  endLocation: endLocation,
  rider: rider,
  startTime: req.body.startTime,
  endTime: req.body.endTime,
  isRecurring: false
});
```

### Location Model

#### Creation Flow
```
POST /api/locations
```

#### Data Flow
1. **Address Validation**: Validate and format address
2. **Coordinate Validation**: Validate lat/lng coordinates
3. **Model Creation**: Create location with tag assignment
4. **Response**: Return created location data

### Notification Model

#### Creation Flow
```
POST /api/notification
```

#### Data Flow
1. **Event Validation**: Validate notification event type
2. **User Resolution**: Resolve user ID and ride ID
3. **Model Creation**: Create notification record
4. **Push Delivery**: Send push notification via SNS
5. **Response**: Return notification data

## Model Update Patterns

### User Updates

#### Update Flow
```
PUT /api/riders/:id
PUT /api/drivers/:id
PUT /api/admins/:id
```

#### Data Flow
1. **Model Retrieval**: Get existing user by ID
2. **Field Updates**: Update specified fields
3. **Validation**: Re-validate updated data
4. **Save**: Save updated model
5. **Response**: Return updated user data

#### Example: Rider Update
```typescript
// PUT /api/riders/:id
const rider = await Rider.get(req.params.id);
rider.firstName = req.body.firstName || rider.firstName;
rider.lastName = req.body.lastName || rider.lastName;
rider.phoneNumber = req.body.phoneNumber || rider.phoneNumber;
rider.address = req.body.address || rider.address;
rider.active = req.body.active !== undefined ? req.body.active : rider.active;

await rider.save();
```

### Ride Updates

#### Update Flow
```
PUT /api/rides/:id
PATCH /api/rides/:id/status
```

#### Data Flow
1. **Model Retrieval**: Get existing ride by ID
2. **Status Updates**: Update ride status and related fields
3. **Notification Trigger**: Send notifications for status changes
4. **Save**: Save updated model
5. **Response**: Return updated ride data

#### Example: Ride Status Update
```typescript
// PATCH /api/rides/:id/status
const ride = await Ride.get(req.params.id);
const oldStatus = ride.status;
ride.status = req.body.status;

// Trigger notifications
if (oldStatus !== ride.status) {
  await sendStatusChangeNotification(ride, oldStatus, ride.status);
}

await ride.save();
```

## Model Query Patterns

### User Queries

#### Email Lookup (Authentication)
```typescript
// Used in auth.ts
const users = await Rider.scan({ email: { eq: email } }).exec();
const users = await Driver.scan({ email: { eq: email } }).exec();
const users = await Admin.scan({ email: { eq: email } }).exec();
```

#### ID Lookup
```typescript
// GET /api/riders/:id
const rider = await Rider.get(req.params.id);
```

#### List Queries
```typescript
// GET /api/riders
const riders = await Rider.scan().exec();
```

### Ride Queries

#### Status-Based Queries
```typescript
// GET /api/rides?status=active
const rides = await Ride.scan({ status: { eq: 'active' } }).exec();
```

#### User-Based Queries
```typescript
// GET /api/rides?riderId=123
const rides = await Ride.scan({ 'rider.id': { eq: riderId } }).exec();
```

#### Time-Based Queries
```typescript
// GET /api/rides?startTime=2024-01-01
const rides = await Ride.scan({ 
  startTime: { between: [startDate, endDate] } 
}).exec();
```

### Location Queries

#### Tag-Based Queries
```typescript
// GET /api/locations?tag=east
const locations = await Location.scan({ tag: { eq: 'east' } }).exec();
```

#### Geographic Queries
```typescript
// GET /api/locations?lat=40.5&lng=-74.0&radius=10
// Note: Requires application-level filtering for radius queries
```

### Notification Queries

#### User Notifications
```typescript
// GET /api/notification/:userId
const notifications = await Notification.scan({ 
  userID: { eq: userId } 
}).exec();
```

#### Unread Notifications
```typescript
// GET /api/notification/:userId?read=false
const notifications = await Notification.scan({ 
  userID: { eq: userId },
  read: { eq: false }
}).exec();
```

### Stats Queries

#### Date-Based Queries
```typescript
// GET /api/stats?year=2024&monthDay=01-15
const stats = await Stats.get({ year: '2024', monthDay: '01-15' });
```

#### Year Queries
```typescript
// GET /api/stats?year=2024
const stats = await Stats.query('year').eq('2024').exec();
```

### Favorite Queries

#### User Favorites
```typescript
// GET /api/favorites/:userId
const favorites = await Favorite.query('userId').eq(userId).exec();
```

#### Favorite Check
```typescript
// GET /api/favorites/:userId/:rideId
const favorite = await Favorite.get({ userId, rideId });
```

## Data Relationships and Resolution

### Embedded Object Resolution

#### Ride Creation with Embedded Objects
```typescript
// Resolve locations
const startLocation = await Location.get(startLocationId);
const endLocation = await Location.get(endLocationId);

// Resolve rider
const rider = await Rider.get(riderId);

// Resolve driver (optional)
const driver = driverId ? await Driver.get(driverId) : undefined;

// Create ride with embedded objects
const ride = new Ride({
  startLocation: startLocation,
  endLocation: endLocation,
  rider: rider,
  driver: driver
});
```

### Reference Resolution

#### User Data Resolution
```typescript
// Resolve user from ID
const user = await getUserById(userId, userType);

function getUserById(id: string, userType: string) {
  switch (userType) {
    case 'Rider':
      return Rider.get(id);
    case 'Driver':
      return Driver.get(id);
    case 'Admin':
      return Admin.get(id);
  }
}
```

## Data Validation and Error Handling

### Model Validation

#### Schema Validation
```typescript
// Automatic validation on save
const rider = new Rider({
  email: 'invalid-email', // Will fail validation
  phoneNumber: '123' // Will fail validation
});

try {
  await rider.save();
} catch (error) {
  // Handle validation errors
  res.status(400).send({ err: error.message });
}
```

#### Custom Validation
```typescript
// Address validation
const address = formatAddress(req.body.address);
if (!isAddress(address)) {
  res.status(400).send({ err: 'Invalid address format' });
}
```

### Error Handling Patterns

#### Model Not Found
```typescript
try {
  const rider = await Rider.get(id);
  if (!rider) {
    res.status(404).send({ err: 'Rider not found' });
    return;
  }
} catch (error) {
  res.status(500).send({ err: error.message });
}
```

#### Duplicate Creation
```typescript
// Check for existing user
const existingRider = await Rider.scan({ email: { eq: email } }).exec();
if (existingRider.length > 0) {
  res.status(400).send({ err: 'Rider already exists' });
  return;
}
```

## Performance Considerations

### Query Optimization

#### Scan vs Get Operations
- **Get**: Use for primary key lookups (fastest)
- **Scan**: Use for complex queries (slower, consider pagination)

#### Pagination
```typescript
// Paginated scan
const rides = await Ride.scan()
  .limit(50)
  .startAt(lastEvaluatedKey)
  .exec();
```

### Data Consistency

#### Atomic Updates
```typescript
// Update with conditional check
const ride = await Ride.get(id);
if (ride.status === Status.NOT_STARTED) {
  ride.status = Status.ON_THE_WAY;
  await ride.save();
}
```

#### Transaction Patterns
```typescript
// Multiple model updates
const ride = await Ride.get(rideId);
const notification = new Notification({
  rideID: rideId,
  userID: ride.rider.id,
  // ... other fields
});

await Promise.all([
  ride.save(),
  notification.save()
]);
```

## Data Migration and Maintenance

### Model Updates
- **Schema Changes**: Requires careful migration planning
- **Data Transformation**: Handle existing data during updates
- **Backward Compatibility**: Maintain API compatibility

### Data Cleanup
```typescript
// Cleanup old notifications
const oldNotifications = await Notification.scan({
  timeSent: { lt: thirtyDaysAgo }
}).exec();

await Promise.all(
  oldNotifications.map(notif => notif.delete())
);
```
