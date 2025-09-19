# Carriage Ride System: Backend Architecture Document

**Version:** 1.0.0
**Date:** September 15, 2025
**Author:** Backend System Architect
**Based on:** RideSystem_comprehensive.pdf v7.2.3

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Backend System Architecture](#3-backend-system-architecture)
   - 3.1 [Data Models and Database Design](#31-data-models-and-database-design)
   - 3.2 [API Design and Endpoints](#32-api-design-and-endpoints)
   - 3.3 [Core Services Architecture](#33-core-services-architecture)
   - 3.4 [State Management System](#34-state-management-system)
   - 3.5 [Recurrence and Materialization Engine](#35-recurrence-and-materialization-engine)
   - 3.6 [Scheduling and Collision Detection](#36-scheduling-and-collision-detection)
   - 3.7 [Event-Driven Architecture](#37-event-driven-architecture)
   - 3.8 [Authentication and Authorization](#38-authentication-and-authorization)
   - 3.9 [Data Access Layer](#39-data-access-layer)
   - 3.10 [Performance and Scalability](#310-performance-and-scalability)
   - 3.11 [Security Considerations](#311-security-considerations)
   - 3.12 [Testing Strategy](#312-testing-strategy)

---

## 1. System Overview

The Carriage Ride System backend implements a comprehensive ride scheduling and management platform that handles the complete lifecycle of transportation requests from riders to drivers, with admin oversight. The system is designed around event-driven architecture principles and implements complex state management for rides that can be either standalone or part of recurring series.

### 1.1 Core Capabilities

- **Ride Lifecycle Management**: Complete workflow from request to completion
- **Recurrence Handling**: RFC 5545-based recurring ride patterns
- **State Management**: Multi-dimensional state tracking (Time, Scheduling, Approval, Operational)
- **Role-based Operations**: Distinct capabilities for Riders, Admins, and Drivers
- **Real-time Updates**: Event-driven notifications across all system participants
- **Collision Detection**: Automated scheduling conflict prevention
- **Materialization Engine**: Virtual to physical ride conversion system

## 2. Architecture Principles

### 2.1 Design Philosophy

The backend architecture follows these core principles:

- **Event-Driven**: All state changes generate events for real-time updates
- **State-Centric**: Explicit state machines govern ride progression
- **Role-Based**: Operations are strictly controlled by user roles and permissions
- **Constraint-Driven**: Business rules are enforced at the service layer
- **Scalable**: Designed for horizontal scaling and high availability
- **Testable**: Clear separation of concerns for comprehensive testing

### 2.2 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: Amazon DynamoDB for primary storage
- **Caching**: Redis for session and performance optimization
- **Authentication**: JWT-based with role-based access control
- **Real-time**: WebSocket connections for live updates
- **Scheduling**: Cron-based job scheduler for materialization
- **API**: RESTful design with OpenAPI specifications

---

## 3. Backend System Architecture

### 3.1 Data Models and Database Design

#### 3.1.1 Database Schema Architecture

The system uses DynamoDB as the primary database with carefully designed partition and sort keys for optimal performance:

**Primary Tables:**
- `RideSeries` - Recurring ride templates
- `Rides` - Physical ride instances
- `Users` - Rider, Admin, and Driver entities
- `Locations` - Pickup and dropoff locations
- `Events` - Event sourcing for state changes

#### 3.1.2 RideSeries Table Schema

```typescript
interface RideSeriesSchema {
  // Primary Key
  id: string; // Partition Key: SERIES#{uuid}

  // Series Metadata
  riderId: string; // GSI1PK for rider queries
  seriesStatus: 'ACTIVE' | 'EXPIRED';

  // Template Fields (Virtual Features)
  startLocationId: string;
  endLocationId: string;
  templateStartTime: string; // HH:MM format

  // Recurrence Configuration
  seriesStartDate: string; // ISO date
  seriesEndDate: string; // ISO date
  recurrenceRule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    byday?: ('SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA')[];
    count?: number;
    until?: string; // ISO date
  };

  // Materialization Control
  exceptionDates: string[]; // ISO dates
  suppressedDates: string[]; // ISO dates
  recurrenceGenerationDate: string; // ISO date

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.3 Rides Table Schema

```typescript
interface RideSchema {
  // Primary Key
  id: string; // Partition Key: RIDE#{uuid}

  // Relationships
  rideSeriesId?: string; // null for Standalone/Orphaned
  riderId: string; // GSI1PK for rider queries
  driverId?: string; // GSI2PK for driver queries, null if UNSCHEDULED

  // Location and Timing
  startLocationId: string;
  endLocationId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime

  // State Management
  approvalStatus: 'PENDING' | 'APPROVED' | 'APPROVED_WITH_MODIFICATION' | 'REJECTED';
  schedulingState: 'UNSCHEDULED' | 'SCHEDULED';
  operationalStatus: 'NOT_STARTED' | 'ON_THE_WAY' | 'ARRIVED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'ABORTED';

  // Metadata
  rideType: 'STANDALONE' | 'AUTO_GENERATED' | 'MANUAL_GENERATED' | 'ORPHANED';

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.4 Global Secondary Indexes (GSI)

**GSI1 - User-based Queries:**
- PK: `USER#{userId}#{userType}`
- SK: `RIDE#{startTime}` or `SERIES#{createdAt}`
- Purpose: Fetch all rides/series for a specific user

**GSI2 - Time-based Queries:**
- PK: `DATE#{date}`
- SK: `RIDE#{startTime}#{rideId}`
- Purpose: Daily ride queries for materialization and scheduling

**GSI3 - Status-based Queries:**
- PK: `STATUS#{operationalStatus}`
- SK: `RIDE#{startTime}#{rideId}`
- Purpose: Active ride monitoring and state management

#### 3.1.5 Data Access Patterns

```typescript
// Query patterns optimized for DynamoDB
class RideDataAccess {
  // Get all rides for a user on a specific date
  async getUserRidesByDate(userId: string, date: string): Promise<Ride[]> {
    return await this.dynamodb.query({
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': `RIDE#${date}`
      }
    });
  }

  // Get active rides for materialization
  async getActiveRidesByDate(date: string): Promise<Ride[]> {
    return await this.dynamodb.query({
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `DATE#${date}`
      }
    });
  }
}
```

### 3.2 API Design and Endpoints

#### 3.2.1 RESTful API Structure

The API follows REST principles with resource-based URLs and standard HTTP methods:

**Base URL:** `/api/v1`

#### 3.2.2 Ride Management Endpoints

```typescript
// Ride CRUD Operations
POST   /rides                    // Create single ride
GET    /rides                    // List rides with filters
GET    /rides/{rideId}          // Get specific ride
PUT    /rides/{rideId}          // Update single ride
DELETE /rides/{rideId}          // Delete single ride

// Ride Series Operations
POST   /ride-series             // Create recurring ride series
GET    /ride-series             // List ride series
GET    /ride-series/{seriesId}  // Get specific series
PUT    /ride-series/{seriesId}  // Update series (This and Following, All)
DELETE /ride-series/{seriesId}  // Delete series

// Virtual Ride Operations
GET    /ride-series/{seriesId}/virtual-rides  // Get virtual rides for series
POST   /ride-series/{seriesId}/virtual-rides/{date}/materialize  // Manual materialization

// State Management
PUT    /rides/{rideId}/approval-status     // Admin approval operations
PUT    /rides/{rideId}/operational-status  // Driver status updates
PUT    /rides/{rideId}/assign-driver       // Admin driver assignment
```

#### 3.2.3 Request/Response Models

```typescript
// Create Ride Request
interface CreateRideRequest {
  riderId: string;
  startLocationId: string;
  endLocationId: string;
  startTime: string; // ISO datetime
  endTime?: string; // Calculated if not provided
  recurrenceRule?: RecurrenceRule; // For series creation
}

// Ride Response Model
interface RideResponse {
  id: string;
  riderId: string;
  driverId?: string;
  startLocationId: string;
  endLocationId: string;
  startTime: string;
  endTime: string;
  approvalStatus: ApprovalStatus;
  schedulingState: SchedulingState;
  operationalStatus: OperationalStatus;
  timeState: 'UPCOMING' | 'ACTIVE' | 'PAST'; // Computed
  rideType: RideType;
  isVirtual?: boolean; // For virtual rides
  createdAt: string;
  updatedAt: string;
}

// Update Operations
interface UpdateSingleRequest {
  operation: 'SINGLE';
  changes: Partial<RideResponse>;
}

interface UpdateThisAndFollowingRequest {
  operation: 'THIS_AND_FOLLOWING';
  changes: Partial<VirtualFeatures>; // Only virtual features
}

interface UpdateAllRequest {
  operation: 'ALL';
  changes: Partial<VirtualFeatures>;
}
```

#### 3.2.4 Error Handling

```typescript
// Standardized error responses
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Error codes
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEDULING_CONFLICT = 'SCHEDULING_CONFLICT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RIDE_NOT_FOUND = 'RIDE_NOT_FOUND',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  ADVANCE_NOTICE_VIOLATION = 'ADVANCE_NOTICE_VIOLATION',
  SERVICE_WINDOW_VIOLATION = 'SERVICE_WINDOW_VIOLATION'
}
```

### 3.3 Core Services Architecture

#### 3.3.1 Service Layer Design

The service layer implements a domain-driven design with clear separation of concerns:

```typescript
// Core service interfaces
interface IRideService {
  createRide(request: CreateRideRequest, userId: string): Promise<RideResponse>;
  updateRide(rideId: string, updates: UpdateRequest, userId: string): Promise<RideResponse>;
  deleteRide(rideId: string, userId: string): Promise<void>;
  getRide(rideId: string, userId: string): Promise<RideResponse>;
  listRides(filters: RideFilters, userId: string): Promise<RideResponse[]>;
}

interface IRideSeriesService {
  createSeries(request: CreateSeriesRequest, userId: string): Promise<RideSeriesResponse>;
  updateSeries(seriesId: string, updates: SeriesUpdateRequest, userId: string): Promise<RideSeriesResponse>;
  deleteSeries(seriesId: string, deleteType: DeleteType, userId: string): Promise<void>;
  getVirtualRides(seriesId: string, dateRange: DateRange): Promise<RideResponse[]>;
}

interface IMaterializationService {
  manualMaterialize(seriesId: string, date: string, userId: string): Promise<RideResponse>;
  autoMaterialize(date: string): Promise<MaterializationResult>;
  checkMaterializationEligibility(seriesId: string, date: string): Promise<boolean>;
}
```

#### 3.3.2 Service Implementation

```typescript
@Service()
export class RideService implements IRideService {
  constructor(
    private rideRepository: IRideRepository,
    private validationService: IValidationService,
    private stateManager: IStateManager,
    private eventPublisher: IEventPublisher,
    private permissionService: IPermissionService,
    private collisionDetector: ICollisionDetectionService
  ) {}

  async createRide(request: CreateRideRequest, userId: string): Promise<RideResponse> {
    // 1. Validate user permissions
    await this.permissionService.validateRideCreation(userId, request);

    // 2. Validate business rules
    await this.validationService.validateRideRequest(request);

    // 3. Check for scheduling conflicts
    await this.collisionDetector.validateNoConflicts(request);

    // 4. Create ride entity
    const ride = await this.rideRepository.create({
      ...request,
      approvalStatus: 'PENDING',
      schedulingState: 'UNSCHEDULED',
      operationalStatus: 'NOT_STARTED',
      rideType: request.recurrenceRule ? 'SERIES_ROOT' : 'STANDALONE'
    });

    // 5. Publish creation event
    await this.eventPublisher.publish(new RideCreatedEvent(ride));

    return this.mapToResponse(ride);
  }

  async updateRide(rideId: string, updates: UpdateRequest, userId: string): Promise<RideResponse> {
    const ride = await this.rideRepository.findById(rideId);

    // Handle different update types
    switch (updates.operation) {
      case 'SINGLE':
        return this.updateSingleRide(ride, updates.changes, userId);
      case 'THIS_AND_FOLLOWING':
        return this.updateThisAndFollowing(ride, updates.changes, userId);
      case 'ALL':
        return this.updateAllInSeries(ride, updates.changes, userId);
    }
  }

  private async updateSingleRide(ride: Ride, changes: Partial<RideResponse>, userId: string): Promise<RideResponse> {
    // Validate permissions
    await this.permissionService.validateRideUpdate(userId, ride, changes);

    // Check if this is a virtual ride that needs materialization
    if (ride.isVirtual) {
      return this.handleVirtualRideUpdate(ride, changes, userId);
    }

    // Update physical ride
    const updatedRide = await this.rideRepository.update(ride.id, changes);
    await this.eventPublisher.publish(new RideUpdatedEvent(updatedRide, changes));

    return this.mapToResponse(updatedRide);
  }
}
```

### 3.4 State Management System

#### 3.4.1 State Machine Architecture

The ride system implements multiple concurrent state machines that govern ride progression:

```typescript
// State machine definitions
enum TimeState {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  PAST = 'PAST'
}

enum SchedulingState {
  UNSCHEDULED = 'UNSCHEDULED',
  SCHEDULED = 'SCHEDULED'
}

enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  APPROVED_WITH_MODIFICATION = 'APPROVED_WITH_MODIFICATION',
  REJECTED = 'REJECTED'
}

enum OperationalStatus {
  NOT_STARTED = 'NOT_STARTED',
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  ABORTED = 'ABORTED'
}
```

#### 3.4.2 State Transition Engine

```typescript
@Service()
export class StateManager implements IStateManager {
  private readonly operationalTransitions = new Map([
    [OperationalStatus.NOT_STARTED, [OperationalStatus.ON_THE_WAY, OperationalStatus.CANCELLED]],
    [OperationalStatus.ON_THE_WAY, [OperationalStatus.ARRIVED, OperationalStatus.CANCELLED, OperationalStatus.ABORTED]],
    [OperationalStatus.ARRIVED, [OperationalStatus.PICKED_UP, OperationalStatus.NO_SHOW, OperationalStatus.ABORTED]],
    [OperationalStatus.PICKED_UP, [OperationalStatus.COMPLETED, OperationalStatus.ABORTED]],
    // Terminal states have no outgoing transitions
    [OperationalStatus.COMPLETED, []],
    [OperationalStatus.CANCELLED, []],
    [OperationalStatus.NO_SHOW, []],
    [OperationalStatus.ABORTED, []]
  ]);

  async validateStateTransition(
    ride: Ride,
    newStatus: OperationalStatus,
    userId: string
  ): Promise<ValidationResult> {
    // 1. Check if transition is valid
    const validTransitions = this.operationalTransitions.get(ride.operationalStatus) || [];
    if (!validTransitions.includes(newStatus)) {
      throw new InvalidStateTransitionError(
        `Cannot transition from ${ride.operationalStatus} to ${newStatus}`
      );
    }

    // 2. Check user permissions for this transition
    await this.permissionService.validateStatusUpdate(userId, ride, newStatus);

    // 3. Check ride state constraints
    if (newStatus !== OperationalStatus.NOT_STARTED && ride.timeState !== TimeState.ACTIVE) {
      throw new StateConstraintError('Operational status can only be updated for ACTIVE rides');
    }

    return { isValid: true };
  }

  computeTimeState(ride: Ride): TimeState {
    const now = new Date();
    const startTime = new Date(ride.startTime);
    const endTime = new Date(ride.endTime);

    if (now < startTime) return TimeState.UPCOMING;
    if (now >= startTime && now <= endTime) return TimeState.ACTIVE;
    return TimeState.PAST;
  }
}
```

#### 3.4.3 Multi-dimensional State Coordination

```typescript
interface RideStateSnapshot {
  timeState: TimeState;
  schedulingState: SchedulingState;
  approvalStatus: ApprovalStatus;
  operationalStatus: OperationalStatus;
  computedAt: Date;
}

@Service()
export class RideStateCoordinator {
  async updateRideState(
    rideId: string,
    stateChanges: Partial<RideStateSnapshot>
  ): Promise<RideStateSnapshot> {
    const ride = await this.rideRepository.findById(rideId);
    const currentState = this.computeCurrentState(ride);

    // Validate state changes are compatible
    await this.validateStateCompatibility(currentState, stateChanges);

    // Apply changes atomically
    const newState = { ...currentState, ...stateChanges };
    await this.persistStateChanges(rideId, newState);

    // Publish state change events
    await this.eventPublisher.publish(new RideStateChangedEvent(rideId, currentState, newState));

    return newState;
  }

  private async validateStateCompatibility(
    current: RideStateSnapshot,
    changes: Partial<RideStateSnapshot>
  ): Promise<void> {
    // Business rule: Cannot update operational status if not approved
    if (changes.operationalStatus &&
        current.approvalStatus === ApprovalStatus.PENDING) {
      throw new StateCompatibilityError('Cannot update operational status for pending rides');
    }

    // Business rule: Cannot schedule rejected rides
    if (changes.schedulingState === SchedulingState.SCHEDULED &&
        current.approvalStatus === ApprovalStatus.REJECTED) {
      throw new StateCompatibilityError('Cannot schedule rejected rides');
    }
  }
}
```

### 3.5 Recurrence and Materialization Engine

#### 3.5.1 RFC 5545 Implementation

```typescript
interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byday?: WeekDay[];
  count?: number;
  until?: string;
}

@Service()
export class RecurrenceEngine {
  generateOccurrences(
    rule: RecurrenceRule,
    startDate: Date,
    endDate: Date,
    exceptionDates: Set<string> = new Set()
  ): Date[] {
    const occurrences: Date[] = [];
    let current = new Date(startDate);
    let count = 0;

    while (current <= endDate && (rule.count === undefined || count < rule.count)) {
      const dateString = current.toISOString().split('T')[0];

      if (!exceptionDates.has(dateString)) {
        occurrences.push(new Date(current));
        count++;
      }

      current = this.getNextOccurrence(current, rule);
    }

    return occurrences;
  }

  private getNextOccurrence(current: Date, rule: RecurrenceRule): Date {
    const next = new Date(current);

    switch (rule.frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + rule.interval);
        break;
      case 'WEEKLY':
        if (rule.byday && rule.byday.length > 0) {
          return this.getNextWeekdayOccurrence(next, rule);
        }
        next.setDate(next.getDate() + (7 * rule.interval));
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + rule.interval);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + rule.interval);
        break;
    }

    return next;
  }

  private getNextWeekdayOccurrence(current: Date, rule: RecurrenceRule): Date {
    const weekDayMap = {
      'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
    };

    const targetDays = rule.byday!.map(day => weekDayMap[day]).sort();
    const currentDay = current.getDay();

    // Find next occurrence within the week
    for (const targetDay of targetDays) {
      if (targetDay > currentDay) {
        const next = new Date(current);
        next.setDate(next.getDate() + (targetDay - currentDay));
        return next;
      }
    }

    // Move to next week and find first target day
    const next = new Date(current);
    const daysToNextWeek = 7 - currentDay + targetDays[0];
    next.setDate(next.getDate() + daysToNextWeek);
    return next;
  }
}
```

#### 3.5.2 Auto-Materialization Service

```typescript
@Service()
export class MaterializationService implements IMaterializationService {
  constructor(
    private recurrenceEngine: RecurrenceEngine,
    private rideRepository: IRideRepository,
    private seriesRepository: IRideSeriesRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async autoMaterialize(targetDate: string): Promise<MaterializationResult> {
    const results: MaterializationResult = {
      materialized: [],
      skipped: [],
      errors: []
    };

    // Get all eligible series for materialization
    const eligibleSeries = await this.getEligibleSeries(targetDate);

    for (const series of eligibleSeries) {
      try {
        const materializedRide = await this.materializeSingleRide(series, targetDate);
        if (materializedRide) {
          results.materialized.push(materializedRide);
          await this.updateSeriesAfterMaterialization(series, targetDate);
        } else {
          results.skipped.push(series.id);
        }
      } catch (error) {
        results.errors.push({ seriesId: series.id, error: error.message });
      }
    }

    return results;
  }

  private async getEligibleSeries(targetDate: string): Promise<RideSeries[]> {
    return await this.seriesRepository.findWhere({
      seriesStatus: 'ACTIVE',
      recurrenceGenerationDate: targetDate
    });
  }

  private async materializeSingleRide(
    series: RideSeries,
    targetDate: string
  ): Promise<Ride | null> {
    // Check if date is in exception or suppressed lists
    if (series.exceptionDates.includes(targetDate) ||
        series.suppressedDates.includes(targetDate)) {
      return null;
    }

    // Generate ride from series template
    const ride: Ride = {
      id: this.generateRideId(),
      rideSeriesId: series.id,
      riderId: series.riderId,
      startLocationId: series.startLocationId,
      endLocationId: series.endLocationId,
      startTime: this.combineDateTime(targetDate, series.templateStartTime),
      endTime: this.calculateEndTime(targetDate, series.templateStartTime),
      approvalStatus: 'PENDING',
      schedulingState: 'UNSCHEDULED',
      operationalStatus: 'NOT_STARTED',
      rideType: 'AUTO_GENERATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedRide = await this.rideRepository.create(ride);
    await this.eventPublisher.publish(new RideMaterializedEvent(savedRide, series));

    return savedRide;
  }

  async manualMaterialize(
    seriesId: string,
    date: string,
    userId: string,
    changes?: Partial<VirtualFeatures>
  ): Promise<RideResponse> {
    const series = await this.seriesRepository.findById(seriesId);

    // Validate user permissions
    await this.permissionService.validateMaterialization(userId, series);

    // Check if already materialized
    const existingRide = await this.rideRepository.findBySeriesAndDate(seriesId, date);
    if (existingRide) {
      throw new AlreadyMaterializedError('Ride already exists for this date');
    }

    // Determine materialization type based on changes
    const materializationType = this.determineMaterializationType(changes);

    const ride = await this.materializeSingleRide(series, date);

    if (changes) {
      // Apply changes and handle divergence
      const updatedRide = await this.applyChangesToMaterializedRide(ride!, changes, materializationType);
      await this.handleDivergence(series, date, materializationType);
      return updatedRide;
    }

    // Add to suppressed dates to prevent auto-materialization
    await this.seriesRepository.addSuppressedDate(seriesId, date);

    return this.mapToResponse(ride!);
  }

  private determineMaterializationType(changes?: Partial<VirtualFeatures>): MaterializationType {
    if (!changes) return 'MANUAL_GENERATED';

    const virtualFeatures = new Set(['startTime', 'startLocationId', 'endLocationId']);
    const changedFields = Object.keys(changes);

    const hasVirtualChanges = changedFields.some(field => virtualFeatures.has(field));
    return hasVirtualChanges ? 'ORPHANED' : 'MANUAL_GENERATED';
  }
}
```

### 3.6 Scheduling and Collision Detection

#### 3.6.1 Collision Detection Algorithm

```typescript
@Service()
export class CollisionDetectionService implements ICollisionDetectionService {
  async validateNoConflicts(rideRequest: CreateRideRequest): Promise<ValidationResult> {
    const conflicts = await this.detectConflicts(rideRequest);

    if (conflicts.length > 0) {
      throw new SchedulingConflictError('Scheduling conflicts detected', conflicts);
    }

    return { isValid: true };
  }

  async detectConflicts(request: CreateRideRequest): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check rider conflicts
    const riderConflicts = await this.checkRiderConflicts(
      request.riderId,
      request.startTime,
      request.endTime
    );
    conflicts.push(...riderConflicts);

    // Check driver conflicts (if driver assigned)
    if (request.driverId) {
      const driverConflicts = await this.checkDriverConflicts(
        request.driverId,
        request.startTime,
        request.endTime
      );
      conflicts.push(...driverConflicts);
    }

    return conflicts;
  }

  private async checkRiderConflicts(
    riderId: string,
    startTime: string,
    endTime: string
  ): Promise<SchedulingConflict[]> {
    const existingRides = await this.rideRepository.findRiderRidesInTimeRange(
      riderId, startTime, endTime
    );

    return existingRides
      .filter(ride => this.hasTimeOverlap(ride, startTime, endTime))
      .map(ride => ({
        type: 'RIDER_CONFLICT',
        conflictingRideId: ride.id,
        timeOverlap: this.calculateOverlap(ride, startTime, endTime)
      }));
  }

  private async checkDriverConflicts(
    driverId: string,
    startTime: string,
    endTime: string
  ): Promise<SchedulingConflict[]> {
    const existingRides = await this.rideRepository.findDriverRidesInTimeRange(
      driverId, startTime, endTime
    );

    return existingRides
      .filter(ride => this.hasTimeOverlap(ride, startTime, endTime))
      .map(ride => ({
        type: 'DRIVER_CONFLICT',
        conflictingRideId: ride.id,
        timeOverlap: this.calculateOverlap(ride, startTime, endTime)
      }));
  }

  private hasTimeOverlap(ride: Ride, startTime: string, endTime: string): boolean {
    const rideStart = new Date(ride.startTime);
    const rideEnd = new Date(ride.endTime);
    const requestStart = new Date(startTime);
    const requestEnd = new Date(endTime);

    return requestStart < rideEnd && requestEnd > rideStart;
  }
}
```

#### 3.6.2 Constraint Validation Service

```typescript
@Service()
export class ConstraintValidationService {
  async validateRideConstraints(request: CreateRideRequest): Promise<ValidationResult> {
    const validations = await Promise.all([
      this.validateServiceWindow(request.startTime, request.endTime),
      this.validateAdvanceNotice(request.startTime, request.riderId),
      this.validateBlackoutPeriods(request.startTime),
      this.validateHolidays(request.startTime)
    ]);

    const errors = validations.filter(v => !v.isValid);
    if (errors.length > 0) {
      throw new ConstraintViolationError('Ride constraints violated', errors);
    }

    return { isValid: true };
  }

  private async validateServiceWindow(startTime: string, endTime: string): Promise<ValidationResult> {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour < 6 || startHour >= 22 || endHour < 6 || endHour >= 22) {
      return {
        isValid: false,
        error: 'Rides must be scheduled between 06:00 and 22:00'
      };
    }

    return { isValid: true };
  }

  private async validateAdvanceNotice(startTime: string, riderId: string): Promise<ValidationResult> {
    const rideDate = new Date(startTime);
    const now = new Date();

    // Calculate deadline: 10:00 AM the day before ride date
    const deadline = new Date(rideDate);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(10, 0, 0, 0);

    if (now > deadline) {
      return {
        isValid: false,
        error: 'Ride must be requested before 10:00 AM the day before'
      };
    }

    return { isValid: true };
  }

  private async validateBlackoutPeriods(startTime: string): Promise<ValidationResult> {
    const blackoutPeriods = await this.blackoutService.getBlackoutPeriods();
    const rideDate = new Date(startTime);

    for (const period of blackoutPeriods) {
      if (rideDate >= period.startDate && rideDate <= period.endDate) {
        return {
          isValid: false,
          error: `Rides cannot be scheduled during blackout period: ${period.reason}`
        };
      }
    }

    return { isValid: true };
  }
}
```