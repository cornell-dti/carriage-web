# Server Data Models

## Overview

The Carriage application uses DynamoDB with Dynamoose ODM for data persistence. All models follow a consistent pattern with primary keys, validation, and default configurations.

## Model Configuration

### Default Model Configuration
```typescript
// server/src/util/modelConfig.ts
export default {
  create: process.env.NODE_ENV === 'production' ? false : true,
  update: false,
  prefix: process.env.NODE_ENV === 'test' ? 'test-' : '',
};
```

- **Create**: Tables created automatically in development, manual in production
- **Update**: Schema updates disabled for safety
- **Prefix**: Test tables prefixed with 'test-' in test environment

## Core Models

### 1. Rider Model
**Table**: `Riders`  
**Primary Key**: `id` (String)

```typescript
export type RiderType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  accessibility?: Accessibility[];
  organization?: Organization;
  description?: string;
  joinDate: string;
  endDate: string;
  pronouns?: string;
  address: string;
  favoriteLocations: string[];
  photoLink?: string;
  active: boolean;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **email**: Validated email address (required)
- **active**: Authentication requirement (default: true)
- **phoneNumber**: 10-digit validation
- **address**: Formatted and validated address
- **accessibility**: Array of accessibility needs
- **organization**: RedRunner or CULift

#### Enums
```typescript
export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animal',
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift',
}
```

### 2. Driver Model
**Table**: `Drivers`  
**Primary Key**: `id` (String)

```typescript
export type DriverType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  photoLink?: string;
  availability: DayOfWeek[];
  active?: boolean;
  joinDate?: string;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **email**: Validated email address (required)
- **availability**: Array of available days (default: Monday-Friday)
- **active**: Default true
- **admin**: Boolean flag for admin privileges

#### Enums
```typescript
export enum DayOfWeek {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THURS',
  FRIDAY = 'FRI',
}
```

### 3. Admin Model
**Table**: `Admins`  
**Primary Key**: `id` (String)

```typescript
export type AdminType = {
  id: string;
  firstName: string;
  lastName: string;
  type: AdminRole[];
  isDriver: boolean;
  phoneNumber: string;
  email: string;
  photoLink?: string;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **type**: Array of admin roles
- **isDriver**: Boolean flag for driver capabilities
- **phoneNumber**: 10-digit validation

#### Enums
```typescript
export type AdminRole = 'sds-admin' | 'redrunner-admin';
```

### 4. Ride Model
**Table**: `Rides`  
**Primary Key**: `id` (String)

```typescript
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
  
  // RFC 5545 Recurrence fields
  isRecurring: boolean;
  rrule?: string;
  exdate?: string[];
  rdate?: string[];
  parentRideId?: string;
  recurrenceId?: string;
  timezone?: string;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **type**: Active, past, or unscheduled
- **status**: Operational status (not_started to completed)
- **schedulingState**: Scheduled or unscheduled
- **startLocation/endLocation**: Embedded location objects
- **rider**: Embedded rider object
- **driver**: Optional embedded driver object
- **startTime/endTime**: ISO 8601 validated timestamps

#### Enums
```typescript
export enum Type {
  ACTIVE = 'active',
  PAST = 'past',
  UNSCHEDULED = 'unscheduled',
}

export enum SchedulingState {
  SCHEDULED = 'scheduled',
  UNSCHEDULED = 'unscheduled',
}

export enum Status {
  NOT_STARTED = 'not_started',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}
```

### 5. Location Model
**Table**: `Locations`  
**Primary Key**: `id` (String)

```typescript
export type LocationType = {
  id: string;
  name: string;
  address: string;
  shortName: string;
  info?: string;
  tag: Tag;
  lat: number;
  lng: number;
  photoLink?: string;
  images?: string[];
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **name**: Full location name
- **shortName**: Abbreviated name
- **tag**: Geographic region tag
- **lat/lng**: Geographic coordinates

#### Enums
```typescript
export enum Tag {
  EAST = 'east',
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}
```

### 6. Vehicle Model
**Table**: `Vehicles`  
**Primary Key**: `id` (String)

```typescript
export type VehicleType = {
  id: string;
  name: string;
  capacity: number;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **name**: Vehicle name/identifier
- **capacity**: Passenger capacity

### 7. Notification Model
**Table**: `Notifications`  
**Primary Key**: `id` (String)

```typescript
export type NotificationType = {
  id: string;
  notifEvent: NotificationEvent;
  userID: string;
  rideID: string;
  title: string;
  body: string;
  timeSent: string;
  read: boolean;
};
```

#### Key Fields
- **id**: Unique identifier (hash key)
- **userID**: Target user identifier
- **rideID**: Associated ride identifier
- **notifEvent**: Event type (from Change or Status enums)
- **read**: Read status flag

### 8. Subscription Model
**Table**: `Subscriptions`  
**Primary Key**: `id` (String)

```typescript
export type SubscriptionType = {
  id: string; // endpoint + user type + platform type
  endpoint: string;
  userType: UserType;
  userId: string;
  platform: PlatformType;
  timeAdded: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  preferences: string[];
};
```

#### Key Fields
- **id**: Composite key (endpoint + userType + platform)
- **endpoint**: Push notification endpoint
- **userType**: Admin, Rider, or Driver
- **platform**: Web, Android, or iOS
- **keys**: Web push encryption keys
- **preferences**: Notification preferences array

#### Enums
```typescript
export enum UserType {
  ADMIN = 'Admin',
  RIDER = 'Rider',
  DRIVER = 'Driver',
}

export enum PlatformType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}
```

### 9. Stats Model
**Table**: `Stats`  
**Primary Key**: `year` (String)  
**Range Key**: `monthDay` (String)

```typescript
export type StatsType = {
  year: string;
  monthDay: string;
  dayCount: number;
  dayNoShow: number;
  dayCancel: number;
  nightCount: number;
  nightNoShow: number;
  nightCancel: number;
  drivers: {
    [name: string]: number;
  };
};
```

#### Key Fields
- **year**: Year identifier (hash key)
- **monthDay**: Month-day identifier (range key)
- **dayCount/nightCount**: Ride counts by time period
- **dayNoShow/nightNoShow**: No-show counts
- **dayCancel/nightCancel**: Cancellation counts
- **drivers**: Object with driver name to count mapping

### 10. Favorite Model
**Table**: `Favorites`  
**Primary Key**: `userId` (String)  
**Range Key**: `rideId` (String)

```typescript
const schema = new dynamoose.Schema({
  userId: { type: String, required: true, hashKey: true },
  rideId: { type: String, required: true, rangeKey: true },
  favoritedAt: { type: Date, default: () => new Date() },
});
```

#### Key Fields
- **userId**: User identifier (hash key)
- **rideId**: Ride identifier (range key)
- **favoritedAt**: Timestamp of when ride was favorited

## Relationships and References

### Embedded Objects
- **Ride**: Contains embedded `Rider`, `Driver`, and `Location` objects
- **Location**: Referenced by rides for start/end locations
- **User Models**: Referenced by rides and notifications

### Foreign Key Relationships
- **Notification.userID**: References user IDs across all user types
- **Notification.rideID**: References ride IDs
- **Subscription.userId**: References user IDs
- **Favorite.userId**: References user IDs
- **Favorite.rideId**: References ride IDs

### Data Integrity
- **Email Validation**: All user models validate email format
- **Phone Validation**: 10-digit phone number validation
- **Date Validation**: ISO 8601 format for timestamps
- **Address Validation**: Formatted and validated addresses
- **Enum Validation**: Strict enum value validation

## Indexes and Query Patterns

### Primary Keys
- All models use string-based primary keys
- Stats model uses composite key (year + monthDay)
- Favorite model uses composite key (userId + rideId)

### Query Patterns
- **User Lookup**: By email (scan operation)
- **Ride Queries**: By status, type, scheduling state
- **Location Queries**: By tag, geographic region
- **Notification Queries**: By userID, read status
- **Stats Queries**: By year, month-day combinations

### Global Secondary Indexes
- No explicit GSI definitions in current schema
- Relies on DynamoDB scan operations for complex queries
- Consider adding GSIs for frequently queried fields

## Validation Rules

### Common Validations
- **Email**: Valid email format using validator library
- **Phone**: 10-digit numeric format
- **Dates**: ISO 8601 format validation
- **Enums**: Strict enum value validation
- **Required Fields**: Marked with `required: true`

### Custom Validations
- **Address**: Custom address formatting and validation
- **Pronouns**: Format validation (word/word/word)
- **Join/End Dates**: Date format validation

## Model Usage in APIs

### CRUD Operations
- **Create**: POST endpoints for new entities
- **Read**: GET endpoints with ID or scan operations
- **Update**: PUT/PATCH endpoints for modifications
- **Delete**: DELETE endpoints for removal

### Query Operations
- **Scan**: Used for email lookups and complex queries
- **Get**: Used for ID-based lookups
- **Query**: Used for composite key lookups (Stats, Favorites)

### Data Transformation
- **Embedded Objects**: Full objects embedded in rides
- **Reference Resolution**: User data resolved from IDs
- **Date Formatting**: Consistent ISO 8601 formatting
- **Address Formatting**: Standardized address format
