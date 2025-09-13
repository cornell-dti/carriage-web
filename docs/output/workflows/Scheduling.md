# Scheduling & Repeating Rides Workflow

## Overview

The scheduling workflow covers how the system handles recurring rides, holiday exceptions, and automated ride generation. This workflow includes the RFC 5545 recurrence implementation, holiday handling, and the automated scheduling system that generates individual ride instances from recurring patterns.

## Current Status

**Important Note**: Recurring rides are currently **disabled** in the system. The API returns a 400 error with the message "Recurring rides are not yet supported. Please create a single ride." However, the infrastructure is in place for future implementation.

## Recurrence Data Model

### Ride Schema - Recurrence Fields

**File**: `server/src/models/ride.ts`

The ride model includes RFC 5545 compliant recurrence fields:

```typescript
export type RideType = {
  // ... standard ride fields ...
  
  // RFC 5545 Recurrence fields (placeholders - no functionality yet)
  isRecurring: boolean;
  rrule?: string;        // RFC 5545 recurrence rule
  exdate?: string[];     // Excluded dates (ISO 8601 format)
  rdate?: string[];      // Additional dates (ISO 8601 format)
  parentRideId?: string; // Reference to parent ride for series
  recurrenceId?: string; // Original start time for overrides
  timezone: string;      // Timezone for recurrence calculations
};
```

### Recurrence Field Definitions

- **`isRecurring`**: Boolean flag indicating if the ride is part of a recurring series
- **`rrule`**: RFC 5545 recurrence rule string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
- **`exdate`**: Array of ISO 8601 dates to exclude from the recurrence
- **`rdate`**: Array of additional ISO 8601 dates to include in the recurrence
- **`parentRideId`**: Reference to the master ride that defines the recurrence pattern
- **`recurrenceId`**: Original start time for identifying specific instances in a series
- **`timezone`**: Timezone for recurrence calculations (default: 'America/New_York')

## Automated Scheduling System

### Repeating Ride Generator

**File**: `server/src/util/repeatingRide.ts`

The system includes an automated scheduler that generates individual ride instances from recurring patterns:

#### Schedule Initialization

```typescript
export default function initSchedule() {
  // Run function at 10:05:00 AM every day
  schedule.scheduleJob('0 5 10 * * *', () => {
    createRepeatingRides();
  });
}
```

**Schedule**: Daily at 10:05 AM
**Purpose**: Generate rides for the next day based on recurring patterns

#### Ride Generation Algorithm

```typescript
function createRepeatingRides() {
  const tomorrowDate = moment().add(1, 'days');
  const tomorrowDateOnly = tomorrowDate.format('YYYY-MM-DD');
  const tomorrowDay = tomorrowDate.weekday();

  const condition = new Condition()
    .where('recurring')
    .eq(true)
    .where('recurringDays')
    .contains(tomorrowDay)
    .where('startTime')
    .le(tomorrowDate.toISOString())
    .where('endDate')
    .ge(tomorrowDateOnly)
    .where('deleted')
    .not()
    .contains(tomorrowDateOnly);
}
```

**Query Logic**:
1. **Recurring Rides**: Find rides with `recurring = true`
2. **Day Match**: Check if tomorrow's weekday is in `recurringDays`
3. **Time Range**: Ensure ride start time is before tomorrow
4. **End Date**: Check if tomorrow is before the recurrence end date
5. **Not Deleted**: Exclude dates marked as deleted

#### Individual Ride Creation

```typescript
data?.forEach((masterRide) => {
  const { rider, startLocation, endLocation, startTime, endTime } = masterRide.toJSON();

  const newStartTimeOnly = moment(startTime).format('HH:mm:ss');
  const newStartTime = moment(`${tomorrowDateOnly}T${newStartTimeOnly}`).toISOString();

  const newEndTimeOnly = moment(endTime).format('HH:mm:ss');
  const newEndTime = moment(`${tomorrowDateOnly}T${newEndTimeOnly}`).toISOString();

  const ride = new Ride({
    id: uuid(),
    startTime: newStartTime,
    endTime: newEndTime,
    rider,
    startLocation: startLocation.id ?? startLocation,
    endLocation: endLocation.id ?? endLocation,
  });

  ride.save().catch((err) => console.log(err));
});
```

**Process**:
1. **Extract Time**: Get time components from master ride
2. **Apply Date**: Combine with tomorrow's date
3. **Create Instance**: Generate new ride with unique ID
4. **Save**: Store individual ride instance

## Holiday Handling

### Holiday Definitions

**File**: `frontend/src/util/holidays.ts`

The system includes predefined holidays for the 2024-2025 academic year:

```typescript
export enum Holidays {
  MartinLutherKingJrDay = 'MartinLutherKingJrDay: 2024-01-15 to 2024-01-15',
  MemorialDay = 'MemorialDay: 2024-05-27 to 2024-05-27',
  Juneteenth = 'Juneteenth: 2024-06-19 to 2024-06-19',
  IndependenceDay = 'IndependenceDay: 2024-07-04 to 2024-07-04',
  LaborDay = 'LaborDay: 2024-09-02 to 2024-09-02',
  Thanksgiving = 'Thanksgiving: 2024-11-28 to 2024-12-02',
  WinterBreak = 'WinterBreak: 2024-12-23 to 2025-01-01',
  FallBreak = 'FallBreak: 2024-10-12 to 2024-10-13',
  IndigenousPeoplesDay = 'IndigenousPeoplesDay: 2024-10-14 to 2024-10-14',
  VeteransDay = 'VeteransDay: 2024-11-11 to 2024-11-11',
  FebruaryBreak = 'FebruaryBreak: 2025-02-24 to 2025-02-25',
}
```

### Holiday Processing

#### Holiday Object Structure

```typescript
type holiday = {
  name: string;
  startDate: Date;
  endDate: Date;
};
```

#### Holiday Parsing

```typescript
function parseHoliday(holiday: Holidays): holiday {
  const [name, dates] = holiday.split(': ');
  const [start, end] = dates.split(' to ');
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T23:59:59`);
  return { name, startDate, endDate };
}
```

#### Holiday Check

```typescript
export const isHoliday = (date: Date) => {
  return holidaysList.some((holiday) => {
    return holiday.startDate <= date && holiday.endDate >= date;
  });
};
```

## Date Filtering and Validation

### MiniCal Component

**File**: `frontend/src/components/MiniCal/MiniCal.tsx`

The MiniCal component provides date selection with holiday and weekday filtering:

#### Date Filtering Logic

```typescript
const isWeekday = (date: Date) => {
  return 0 < date.getDay() && date.getDay() < 6;
};

const filterDate = (date: Date) => {
  return isWeekday(date) && !isHoliday(date);
};
```

**Filtering Rules**:
- **Weekdays Only**: Monday through Friday (1-5)
- **No Holidays**: Excludes all defined holiday periods
- **No Weekends**: Saturday and Sunday are blocked

#### Date Selection Features

- **Today/Tomorrow Buttons**: Quick date selection
- **Visual Indicators**: Green dots for today/tomorrow
- **Holiday Blocking**: Automatically excludes holiday periods
- **Weekend Blocking**: Prevents weekend selection

## Recurrence Patterns (Planned)

### RFC 5545 Compliance

The system is designed to support RFC 5545 recurrence rules:

#### Frequency Types
- **DAILY**: Every day
- **WEEKLY**: Every week on specified days
- **MONTHLY**: Every month on specified date
- **YEARLY**: Every year on specified date

#### Example Rules
```
FREQ=WEEKLY;BYDAY=MO,WE,FR    # Monday, Wednesday, Friday
FREQ=DAILY;INTERVAL=2         # Every other day
FREQ=MONTHLY;BYMONTHDAY=15    # 15th of every month
```

#### Exception Handling
- **EXDATE**: Exclude specific dates
- **RDATE**: Include additional dates
- **UNTIL**: End date for recurrence
- **COUNT**: Number of occurrences

## API Implementation

### Ride Creation with Recurrence

**Endpoint**: `POST /api/rides`

**Current Implementation**:
```typescript
// For now, only support single rides (isRecurring = false)
if (isRecurring || recurring) {
  res.status(400).send({ 
    err: 'Recurring rides are not yet supported. Please create a single ride.' 
  });
  return;
}
```

**Planned Implementation**:
```typescript
if (isRecurring) {
  // Create master ride with recurrence pattern
  const masterRide = new Ride({
    ...body,
    isRecurring: true,
    rrule: body.rrule,
    exdate: body.exdate,
    rdate: body.rdate,
    timezone: body.timezone || 'America/New_York'
  });
  
  // Generate initial instances
  const instances = generateRecurrenceInstances(masterRide);
  
  // Save master and instances
  await masterRide.save();
  await Promise.all(instances.map(instance => instance.save()));
}
```

### Recurrence Instance Management

**Planned Endpoints**:
- `GET /api/rides/{id}/instances`: Get all instances of a recurring ride
- `PUT /api/rides/{id}/instances/{instanceId}`: Update specific instance
- `DELETE /api/rides/{id}/instances/{instanceId}`: Delete specific instance
- `PUT /api/rides/{id}/recurrence`: Update recurrence pattern

## Current Limitations

1. **Recurring Rides Disabled**: API blocks all recurring ride creation
2. **No Instance Management**: Cannot edit individual instances
3. **Limited Holiday Support**: Hardcoded holidays for 2024-2025
4. **No Timezone Support**: Fixed to America/New_York
5. **No Exception Handling**: Cannot exclude specific dates
6. **No Advanced Patterns**: Only basic daily/weekly patterns

## Future Enhancements

1. **Full RFC 5545 Support**: Complete recurrence rule implementation
2. **Dynamic Holiday Loading**: API-based holiday data
3. **Timezone Support**: Multi-timezone recurrence calculations
4. **Instance Management**: Edit individual recurring ride instances
5. **Exception Handling**: Exclude/include specific dates
6. **Advanced Patterns**: Monthly, yearly, and complex patterns
7. **Bulk Operations**: Manage multiple instances simultaneously
8. **Conflict Resolution**: Handle scheduling conflicts automatically

## Related Components

- **MiniCal**: Date selection with holiday filtering
- **RequestRideDialog**: Recurring ride configuration (disabled)
- **RideTable**: Display of recurring ride instances
- **Holidays Utility**: Holiday definition and checking

## Dependencies

- **node-schedule**: Automated job scheduling
- **moment**: Date/time manipulation
- **dynamoose**: Database operations
- **react-datepicker**: Date selection component
- **RFC 5545**: Recurrence rule standard

## Implementation Notes

### Database Considerations

- **Master Rides**: Store recurrence patterns and metadata
- **Instance Rides**: Individual ride instances with references to master
- **Indexing**: Efficient queries for recurrence generation
- **Cleanup**: Remove old instances and expired patterns

### Performance Considerations

- **Batch Operations**: Generate multiple instances efficiently
- **Caching**: Cache holiday data and recurrence calculations
- **Background Jobs**: Use queue system for large recurrence sets
- **Database Optimization**: Proper indexing for recurrence queries

### Error Handling

- **Invalid Rules**: Validate RFC 5545 compliance
- **Date Conflicts**: Handle overlapping instances
- **Resource Limits**: Prevent excessive instance generation
- **Rollback**: Revert failed recurrence operations
