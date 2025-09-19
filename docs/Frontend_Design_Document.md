# Carriage Ride System: Frontend Design Document

**Version:** 2.0.0
**Date:** September 15, 2025
**Author:** Claude Code Assistant
**Based on:** RideSystem_comprehensive.pdf v7.2.3

---

## 2. Frontend

This document provides a complete frontend technical design for the new Carriage Ride System. The frontend must support the complex ride lifecycle management, virtual/physical ride concepts, recurring schedules with RFC 5545 compliance, and real-time operational updates across three distinct user roles.

### 2.1. Frontend Architecture Overview

#### 2.1.1. Core Architectural Principles

The frontend architecture is designed around several key principles that directly support the complex ride system requirements:

**Event-Driven Architecture Alignment**
- Real-time state synchronization with backend events
- Optimistic UI updates with rollback capabilities
- WebSocket integration for live operational status updates
- Event-sourced state management for audit trails

**Role-Based UI Architecture**
- Dynamic component rendering based on user permissions
- Context-driven feature availability
- Secure client-side route protection
- Role-specific workflow optimization

**Virtual/Physical Ride Abstraction**
- Unified component interface for both virtual and physical rides
- Transparent materialization workflow integration
- Visual distinction between ride types
- Seamless transition handling during materialization

**Complex State Management**
- Multi-layered state architecture (Global → Context → Component)
- Derived state calculations for TimeState, ApprovalStatus flows
- Optimistic updates with conflict resolution
- State persistence for offline capability

#### 2.1.2. Technology Stack

**Core Framework & Libraries**
- **React 18+** with Concurrent Features for better UX during complex operations
- **TypeScript 4.9+** for comprehensive type safety across complex data models
- **Material-UI v5** for consistent design system with accessibility support
- **React Router v6** for role-based routing and nested route management

**State Management**
- **React Context API** enhanced with useReducer for complex state flows
- **React Query/TanStack Query** for server state management and caching
- **Zustand** for lightweight global state (notifications, user preferences)
- **Immer** for immutable state updates in complex nested objects

**Real-time & Networking**
- **Socket.io Client** for real-time operational status updates
- **Axios** with request/response interceptors for API communication
- **React Hook Form** with Zod validation for complex form handling
- **date-fns** with timezone support for recurrence calculations

**Recurrence & Calendar**
- **rrule.js** for RFC 5545 recurrence rule processing
- **React Big Calendar** for schedule visualization
- **date-fns-tz** for timezone-aware date handling
- **Luxon** for complex date arithmetic in recurrence patterns

#### 2.1.3. Application Structure

```
src/
├── components/
│   ├── Core/                 # Shared UI components
│   ├── RideManagement/       # Ride-specific components
│   ├── RecurrenceEngine/     # Recurrence pattern components
│   ├── RealTime/            # Real-time status components
│   └── RoleSpecific/        # Role-based component variants
├── contexts/
│   ├── RideSeriesContext/   # RideSeries state management
│   ├── VirtualRideContext/  # Virtual ride calculations
│   ├── RealtimeContext/     # WebSocket connections
│   └── PermissionContext/   # Role-based permissions
├── hooks/
│   ├── useRideMaterialization/  # Materialization workflows
│   ├── useRecurrenceEngine/     # Recurrence calculations
│   ├── useRealTimeUpdates/      # Live status updates
│   └── usePermissions/          # Permission checks
├── types/
│   ├── RideSystem/          # Core ride system types
│   ├── Recurrence/          # RFC 5545 related types
│   └── API/                 # API request/response types
├── utils/
│   ├── rideMaterialization/ # Materialization logic
│   ├── recurrenceEngine/    # RFC 5545 processing
│   ├── permissionEngine/    # Permission validation
│   └── dateTimeUtils/       # Date/time utilities
└── pages/
    ├── Admin/               # Admin-specific pages
    ├── Driver/              # Driver-specific pages
    └── Rider/               # Rider-specific pages
```

### 2.2. Data Models and Type System

#### 2.2.1. Core Frontend Type Definitions

The frontend type system extends the backend models with additional UI-specific properties and computed fields:

```typescript
// Core Enums (Extended from Backend)
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  APPROVED_WITH_MODIFICATION = 'APPROVED_WITH_MODIFICATION',
  REJECTED = 'REJECTED'
}

export enum SchedulingState {
  UNSCHEDULED = 'UNSCHEDULED',
  SCHEDULED = 'SCHEDULED'
}

export enum OperationalStatus {
  NOT_STARTED = 'NOT_STARTED',
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  ABORTED = 'ABORTED'
}

export enum TimeState {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  PAST = 'PAST'
}

export enum SeriesStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

// Physical Ride Types Classification
export enum PhysicalRideType {
  STANDALONE = 'STANDALONE',
  AUTO_GENERATED = 'AUTO_GENERATED',
  MANUAL_GENERATED = 'MANUAL_GENERATED',
  ORPHANED = 'ORPHANED'
}
```

#### 2.2.2. RideSeries Interface

```typescript
export interface RecurrenceRule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byday?: ('SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA')[];
  count?: number;
  until?: string; // ISO 8601 date
}

export interface RideSeries {
  id: string;
  riderId: string;
  seriesStatus: SeriesStatus;
  startLocationId: string;
  endLocationId: string;
  templateStartTime: string; // HH:MM format
  seriesStartDate: string; // ISO 8601 date
  seriesEndDate: string; // ISO 8601 date
  recurrenceRule: RecurrenceRule;
  exceptionDates: string[]; // ISO 8601 dates
  suppressedDates: string[]; // ISO 8601 dates
  recurrenceGenerationDate: string; // ISO 8601 date

  // UI-specific computed fields
  nextRideDate?: string;
  totalRidesRemaining?: number;
  upcomingVirtualRides?: VirtualRide[];
}
```

#### 2.2.3. Physical and Virtual Ride Interfaces

```typescript
export interface BaseRide {
  id: string;
  riderId: string;
  driverId?: string;
  startLocationId: string;
  endLocationId: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  approvalStatus: ApprovalStatus;
  schedulingState: SchedulingState;
  operationalStatus: OperationalStatus;

  // Computed fields
  timeState: TimeState;

  // Populated relations
  rider?: Rider;
  driver?: Driver;
  startLocation?: Location;
  endLocation?: Location;
}

export interface PhysicalRide extends BaseRide {
  rideSeriesId?: string; // null for Standalone and Orphaned
  physicalRideType: PhysicalRideType;

  // UI-specific flags
  isPhysical: true;
  canEdit: boolean;
  canDelete: boolean;
  availableActions: RideAction[];
}

export interface VirtualRide extends BaseRide {
  rideSeriesId: string;

  // UI-specific flags
  isVirtual: true;
  canMaterialize: boolean;
  materializationTriggers: MaterializationTrigger[];
}

export type UnifiedRide = PhysicalRide | VirtualRide;
```

#### 2.2.4. CRUD Operation Types

```typescript
export enum CRUDOperationType {
  SINGLE = 'SINGLE',
  THIS_AND_FOLLOWING = 'THIS_AND_FOLLOWING',
  ALL = 'ALL'
}

export interface CRUDOperation<T = any> {
  type: CRUDOperationType;
  targetId: string;
  changes: Partial<T>;
  userRole: UserRole;
  timestamp: string;
}

export interface CRUDConstraints {
  canEdit: boolean;
  canDelete: boolean;
  canEditRecurrence: boolean;
  constraintReasons: string[];
  availableOperations: CRUDOperationType[];
}
```

### 2.3. State Management Architecture

#### 2.3.1. Multi-Layer State Strategy

The frontend implements a sophisticated multi-layer state management system to handle the complexity of virtual/physical rides, real-time updates, and role-based permissions:

**Layer 1: Global Application State**
```typescript
// Global state using Zustand for lightweight, cross-cutting concerns
interface GlobalState {
  currentUser: User;
  userRole: UserRole;
  notifications: Notification[];
  realTimeConnection: SocketConnection;
  applicationMode: 'online' | 'offline' | 'syncing';
}
```

**Layer 2: Domain Context State**
```typescript
// RideSeriesContext - manages ride series and virtual ride generation
interface RideSeriesState {
  rideSeries: RideSeries[];
  loading: boolean;
  error: Error | null;

  // Core operations
  createRideSeries: (series: CreateRideSeriesRequest) => Promise<RideSeries>;
  updateRideSeries: (id: string, updates: Partial<RideSeries>, operation: CRUDOperationType) => Promise<void>;
  deleteRideSeries: (id: string, operation: CRUDOperationType) => Promise<void>;

  // Virtual ride generation
  generateVirtualRides: (seriesId: string, dateRange: DateRange) => VirtualRide[];
  materializeVirtualRide: (virtualRide: VirtualRide, changes?: Partial<PhysicalRide>) => Promise<PhysicalRide>;

  // Utility functions
  getVirtualRidesForDate: (date: string) => VirtualRide[];
  getSeriesById: (id: string) => RideSeries | undefined;
}

// PhysicalRidesContext - manages concrete ride instances
interface PhysicalRidesState {
  physicalRides: PhysicalRide[];
  scheduledRides: PhysicalRide[];
  unscheduledRides: PhysicalRide[];
  loading: boolean;
  error: Error | null;

  // Core operations with optimistic updates
  createPhysicalRide: (ride: CreatePhysicalRideRequest) => Promise<PhysicalRide>;
  updatePhysicalRide: (id: string, updates: Partial<PhysicalRide>) => Promise<PhysicalRide>;
  deletePhysicalRide: (id: string) => Promise<void>;

  // Status update operations
  updateOperationalStatus: (id: string, status: OperationalStatus) => Promise<void>;
  updateApprovalStatus: (id: string, status: ApprovalStatus) => Promise<void>;
  updateSchedulingState: (id: string, state: SchedulingState, driverId?: string) => Promise<void>;

  // Real-time update handlers
  handleRealtimeStatusUpdate: (update: RealtimeStatusUpdate) => void;
  handleRideAssignment: (assignment: RideAssignment) => void;
}
```

**Layer 3: Component-Level State**
- Local component state for UI interactions (form inputs, modal states, etc.)
- Derived state calculations (time remaining, constraints, etc.)
- Temporary state during complex operations (multi-step forms, bulk operations)

#### 2.3.2. State Synchronization Patterns

**Optimistic Updates with Rollback**
```typescript
const useOptimisticRideUpdate = () => {
  const updateRideWithOptimism = async (
    rideId: string,
    updates: Partial<UnifiedRide>,
    operation: CRUDOperationType
  ) => {
    // 1. Create snapshot for rollback
    const originalRide = getRideById(rideId);

    // 2. Apply optimistic update
    updateRideInState(rideId, updates);

    try {
      // 3. Send to server
      const serverResponse = await api.updateRide(rideId, updates, operation);

      // 4. Sync with server response
      updateRideInState(rideId, serverResponse);

    } catch (error) {
      // 5. Rollback on failure
      if (originalRide) {
        updateRideInState(rideId, originalRide);
      }
      throw error;
    }
  };
};
```

**Real-time State Synchronization**
```typescript
const useRealtimeSync = () => {
  useEffect(() => {
    const socket = getSocketConnection();

    socket.on('ride:status_updated', (update: RealtimeStatusUpdate) => {
      updatePhysicalRideStatus(update.rideId, {
        operationalStatus: update.newStatus,
        lastUpdated: update.timestamp
      });
    });

    socket.on('ride:assigned', (assignment: RideAssignment) => {
      updatePhysicalRideDriver(assignment.rideId, assignment.driverId);
      moveRideBetweenLists(assignment.rideId, 'unscheduled', 'scheduled');
    });

    socket.on('ride:materialized', (materialization: RideMaterialization) => {
      // Remove virtual ride from generated list
      removeVirtualRide(materialization.virtualRideId);
      // Add new physical ride
      addPhysicalRide(materialization.physicalRide);
    });

    return () => socket.disconnect();
  }, []);
};
```

### 2.4. Component Architecture and Design Patterns

#### 2.4.1. Component Hierarchy Overview

The component architecture is organized around the core ride system concepts with clear separation of concerns:

```
RideSystemApp/
├── Layout/
│   ├── RoleBasedHeader/
│   ├── NavigationSidebar/
│   └── NotificationCenter/
├── RideManagement/
│   ├── RideSeriesManager/
│   │   ├── RideSeriesTable/
│   │   ├── CreateRideSeriesModal/
│   │   ├── EditRideSeriesModal/
│   │   └── RecurrencePatternBuilder/
│   ├── VirtualRideManager/
│   │   ├── VirtualRideCalendar/
│   │   ├── VirtualRideList/
│   │   └── VirtualRideMaterializationModal/
│   ├── PhysicalRideManager/
│   │   ├── PhysicalRideTable/
│   │   ├── RideDetailsModal/
│   │   ├── EditRideModal/
│   │   └── BulkOperationsPanel/
│   └── UnifiedRideView/
│       ├── RideCalendarView/
│       ├── RideListView/
│       └── RideKanbanView/
├── OperationalManagement/
│   ├── RealtimeStatusBoard/
│   ├── DriverOperationsPanel/
│   ├── RideProgressTracker/
│   └── StatusUpdateModal/
├── RecurrenceEngine/
│   ├── RecurrenceRuleBuilder/
│   ├── RecurrencePreview/
│   ├── ExceptionDateManager/
│   └── RFC5545Validator/
└── RoleSpecificViews/
    ├── AdminDashboard/
    ├── DriverDashboard/
    └── RiderDashboard/
```

#### 2.4.2. Core Design Patterns

**Unified Ride Interface Pattern**
```typescript
interface UnifiedRideComponentProps {
  ride: UnifiedRide;
  viewMode: 'read' | 'edit' | 'operate';
  userRole: UserRole;
  onAction: (action: RideAction) => void;
}

const UnifiedRideCard: React.FC<UnifiedRideComponentProps> = ({
  ride,
  viewMode,
  userRole,
  onAction
}) => {
  const permissions = useRidePermissions(ride, userRole);
  const isVirtual = 'isVirtual' in ride && ride.isVirtual;

  return (
    <Card variant={isVirtual ? 'outlined' : 'elevation'}>
      <RideHeader ride={ride} isVirtual={isVirtual} />

      {isVirtual && (
        <VirtualRideBanner
          ride={ride as VirtualRide}
          onMaterialize={() => onAction('materialize')}
        />
      )}

      <RideDetails ride={ride} viewMode={viewMode} />

      <RideActions
        ride={ride}
        permissions={permissions}
        onAction={onAction}
      />
    </Card>
  );
};
```

**Materialization Workflow Pattern**
```typescript
const useMaterializationWorkflow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<MaterializationStep>('SELECT_CHANGES');

  const materializeVirtualRide = async (
    virtualRide: VirtualRide,
    changes: MaterializationChanges
  ) => {
    setIsProcessing(true);
    setStep('VALIDATING');

    try {
      // 1. Validate changes and determine materialization type
      const materializationType = determineMaterializationType(changes);
      setStep('MATERIALIZING');

      // 2. Create physical ride with appropriate type
      const physicalRide = await createPhysicalRideFromVirtual(
        virtualRide,
        changes,
        materializationType
      );

      setStep('UPDATING_SERIES');

      // 3. Update parent series (suppressedDates or exceptionDates)
      if (materializationType === 'ORPHANED') {
        await addExceptionDate(virtualRide.rideSeriesId, virtualRide.startTime);
      } else {
        await addSuppressedDate(virtualRide.rideSeriesId, virtualRide.startTime);
      }

      setStep('COMPLETED');
      return physicalRide;

    } catch (error) {
      setStep('ERROR');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    materializeVirtualRide,
    isProcessing,
    currentStep: step
  };
};
```

**CRUD Operation Delegation Pattern**
```typescript
const useCRUDOperations = (targetRide: UnifiedRide) => {
  const permissions = useRidePermissions(targetRide);

  const executeOperation = async (
    operation: CRUDOperationType,
    changes: Partial<UnifiedRide>
  ) => {
    switch (operation) {
      case CRUDOperationType.SINGLE:
        return await executeSingleRideUpdate(targetRide.id, changes);

      case CRUDOperationType.THIS_AND_FOLLOWING:
        if ('isVirtual' in targetRide && targetRide.isVirtual) {
          return await executeSeriesSplit(targetRide.rideSeriesId, targetRide.startTime, changes);
        }
        throw new Error('This and Following only supported for virtual rides');

      case CRUDOperationType.ALL:
        if ('rideSeriesId' in targetRide && targetRide.rideSeriesId) {
          return await executeSeriesUpdate(targetRide.rideSeriesId, changes);
        }
        throw new Error('Update All only supported for series-linked rides');
    }
  };

  return {
    executeOperation,
    availableOperations: permissions.availableOperations,
    constraints: permissions.constraints
  };
};
```

### 2.5. Recurrence Engine and RFC 5545 Implementation

#### 2.5.1. Recurrence Rule Builder Interface

The frontend provides a sophisticated interface for creating and editing RFC 5545-compliant recurrence rules:

```typescript
interface RecurrenceBuilderProps {
  initialRule?: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
  constraints?: RecurrenceConstraints;
}

const RecurrenceRuleBuilder: React.FC<RecurrenceBuilderProps> = ({
  initialRule,
  onChange,
  constraints
}) => {
  const [frequency, setFrequency] = useState(initialRule?.frequency || 'WEEKLY');
  const [interval, setInterval] = useState(initialRule?.interval || 1);
  const [selectedDays, setSelectedDays] = useState(initialRule?.byday || []);
  const [endCondition, setEndCondition] = useState<'never' | 'count' | 'until'>('never');

  const previewDates = useRecurrencePreview({
    frequency,
    interval,
    byday: selectedDays,
    startDate: new Date(),
    endCondition
  });

  return (
    <Box>
      <FrequencySelector
        value={frequency}
        onChange={setFrequency}
        disabled={constraints?.disallowedFrequencies}
      />

      <IntervalSelector
        frequency={frequency}
        value={interval}
        onChange={setInterval}
        max={constraints?.maxInterval}
      />

      {frequency === 'WEEKLY' && (
        <DayOfWeekSelector
          selectedDays={selectedDays}
          onChange={setSelectedDays}
          constraints={constraints?.dayConstraints}
        />
      )}

      <EndConditionSelector
        value={endCondition}
        onChange={setEndCondition}
        maxCount={constraints?.maxOccurrences}
        maxDate={constraints?.maxEndDate}
      />

      <RecurrencePreview
        previewDates={previewDates}
        maxPreview={10}
      />
    </Box>
  );
};
```

#### 2.5.2. Virtual Ride Generation Engine

```typescript
const useVirtualRideGeneration = (rideSeries: RideSeries) => {
  const generateVirtualRides = useCallback((
    dateRange: { start: Date; end: Date }
  ): VirtualRide[] => {
    const { recurrenceRule, exceptionDates, suppressedDates } = rideSeries;

    // 1. Generate dates using rrule.js
    const rrule = new RRule({
      freq: RRule[recurrenceRule.frequency],
      interval: recurrenceRule.interval,
      byweekday: recurrenceRule.byday?.map(day => RRule[day]),
      dtstart: new Date(rideSeries.seriesStartDate),
      until: recurrenceRule.until ? new Date(recurrenceRule.until) : undefined,
      count: recurrenceRule.count
    });

    const occurrences = rrule.between(dateRange.start, dateRange.end);

    // 2. Filter out exception and suppressed dates
    const validOccurrences = occurrences.filter(date => {
      const dateStr = date.toISOString().split('T')[0];
      return !exceptionDates.includes(dateStr) && !suppressedDates.includes(dateStr);
    });

    // 3. Convert to VirtualRide objects
    return validOccurrences.map(date => createVirtualRideFromSeries(rideSeries, date));

  }, [rideSeries]);

  return { generateVirtualRides };
};
```

#### 2.5.3. Exception and Suppression Date Management

```typescript
const ExceptionDateManager: React.FC<{
  rideSeries: RideSeries;
  onUpdate: (dates: string[]) => void;
}> = ({ rideSeries, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [exceptionDates, setExceptionDates] = useState(rideSeries.exceptionDates);

  const addExceptionDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (!exceptionDates.includes(dateStr)) {
      const newDates = [...exceptionDates, dateStr];
      setExceptionDates(newDates);
      onUpdate(newDates);
    }
  };

  const removeExceptionDate = (dateStr: string) => {
    const newDates = exceptionDates.filter(d => d !== dateStr);
    setExceptionDates(newDates);
    onUpdate(newDates);
  };

  return (
    <Box>
      <Typography variant="h6">Exception Dates</Typography>
      <Typography variant="caption">
        Dates when this recurring ride will NOT occur
      </Typography>

      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        shouldDisableDate={(date) => exceptionDates.includes(date.toISOString().split('T')[0])}
      />

      <Button
        onClick={() => selectedDate && addExceptionDate(selectedDate)}
        disabled={!selectedDate}
      >
        Add Exception Date
      </Button>

      <List>
        {exceptionDates.map(dateStr => (
          <ListItem key={dateStr}>
            <ListItemText primary={format(new Date(dateStr), 'MMM dd, yyyy')} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => removeExceptionDate(dateStr)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
```

### 2.6. Real-time Status Management

#### 2.6.1. WebSocket Integration Architecture

```typescript
interface RealtimeConnection {
  socket: Socket;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  subscriptions: Set<string>;
}

const useRealtimeConnection = () => {
  const [connection, setConnection] = useState<RealtimeConnection | null>(null);
  const { currentUser } = useGlobalState();

  useEffect(() => {
    const socket = io(process.env.REACT_APP_WEBSOCKET_URL, {
      auth: { userId: currentUser.id, userRole: currentUser.role }
    });

    socket.on('connect', () => {
      setConnection(prev => prev ? { ...prev, connectionStatus: 'connected' } : null);
    });

    socket.on('disconnect', () => {
      setConnection(prev => prev ? { ...prev, connectionStatus: 'disconnected' } : null);
    });

    setConnection({
      socket,
      connectionStatus: 'connected',
      subscriptions: new Set()
    });

    return () => {
      socket.disconnect();
      setConnection(null);
    };
  }, [currentUser]);

  return connection;
};
```

#### 2.6.2. Live Status Update Components

```typescript
const RealtimeStatusBoard: React.FC = () => {
  const { physicalRides } = usePhysicalRides();
  const connection = useRealtimeConnection();

  const activeRides = physicalRides.filter(ride =>
    ride.timeState === TimeState.ACTIVE &&
    ride.operationalStatus !== OperationalStatus.NOT_STARTED
  );

  useEffect(() => {
    if (!connection) return;

    // Subscribe to status updates for all active rides
    activeRides.forEach(ride => {
      connection.socket.emit('subscribe', `ride:${ride.id}`);
      connection.subscriptions.add(`ride:${ride.id}`);
    });

    return () => {
      connection.subscriptions.forEach(subscription => {
        connection.socket.emit('unsubscribe', subscription);
      });
      connection.subscriptions.clear();
    };
  }, [activeRides, connection]);

  return (
    <Grid container spacing={2}>
      {activeRides.map(ride => (
        <Grid item xs={12} md={6} lg={4} key={ride.id}>
          <LiveRideCard ride={ride} />
        </Grid>
      ))}
    </Grid>
  );
};

const LiveRideCard: React.FC<{ ride: PhysicalRide }> = ({ ride }) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const connection = useRealtimeConnection();

  useEffect(() => {
    if (!connection) return;

    const handleStatusUpdate = (update: RealtimeStatusUpdate) => {
      if (update.rideId === ride.id) {
        setLastUpdate(new Date(update.timestamp));
      }
    };

    connection.socket.on('ride:status_updated', handleStatusUpdate);

    return () => {
      connection.socket.off('ride:status_updated', handleStatusUpdate);
    };
  }, [connection, ride.id]);

  return (
    <Card>
      <CardHeader
        title={`${ride.rider?.firstName} ${ride.rider?.lastName}`}
        subheader={`Driver: ${ride.driver?.firstName} ${ride.driver?.lastName}`}
        action={
          <Chip
            label={ride.operationalStatus}
            color={getStatusColor(ride.operationalStatus)}
            variant="filled"
          />
        }
      />
      <CardContent>
        <RideProgressStepper
          currentStatus={ride.operationalStatus}
          timestamps={ride.statusTimestamps}
        />
        <Typography variant="caption" display="block">
          Last updated: {formatDistanceToNow(lastUpdate)} ago
        </Typography>
      </CardContent>
    </Card>
  );
};
```

### 2.7. Role-Based Permission System

#### 2.7.1. Permission Context and Hooks

```typescript
interface PermissionContext {
  userRole: UserRole;
  permissions: UserPermissions;
  checkPermission: (action: string, resource: any) => boolean;
  getConstraints: (resource: any) => ResourceConstraints;
}

const useRidePermissions = (ride: UnifiedRide) => {
  const { userRole, checkPermission } = usePermissions();
  const { currentUser } = useGlobalState();

  const canEdit = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return true;

      case 'rider':
        // Riders can only edit their own rides under specific conditions
        return ride.riderId === currentUser.id &&
               ride.approvalStatus === ApprovalStatus.PENDING &&
               ride.timeState === TimeState.UPCOMING &&
               ride.schedulingState === SchedulingState.UNSCHEDULED &&
               ride.operationalStatus === OperationalStatus.NOT_STARTED;

      case 'driver':
        // Drivers can only update operational status for assigned active rides
        return ride.driverId === currentUser.id &&
               ride.timeState === TimeState.ACTIVE;

      default:
        return false;
    }
  }, [userRole, ride, currentUser]);

  const canDelete = useMemo(() => {
    switch (userRole) {
      case 'admin':
        return true;

      case 'rider':
        // Same constraints as editing for riders
        return canEdit;

      default:
        return false;
    }
  }, [userRole, canEdit]);

  const availableActions = useMemo(() => {
    const actions: RideAction[] = [];

    if (canEdit) {
      actions.push('edit');

      // Role-specific actions
      if (userRole === 'admin') {
        actions.push('approve', 'reject', 'assign_driver', 'reschedule');
      }

      if (userRole === 'driver' && ride.timeState === TimeState.ACTIVE) {
        actions.push('update_status', 'report_issue');
      }
    }

    if (canDelete) {
      actions.push('delete');
    }

    // Virtual ride specific actions
    if ('isVirtual' in ride && ride.isVirtual) {
      actions.push('materialize');
    }

    return actions;
  }, [canEdit, canDelete, userRole, ride]);

  return {
    canEdit,
    canDelete,
    availableActions,
    constraints: getConstraints(ride)
  };
};
```

#### 2.7.2. Role-Specific UI Components

```typescript
const RoleBasedRideActions: React.FC<{
  ride: UnifiedRide;
  onAction: (action: RideAction) => void;
}> = ({ ride, onAction }) => {
  const permissions = useRidePermissions(ride);
  const { userRole } = usePermissions();

  const renderAdminActions = () => (
    <ButtonGroup>
      {ride.approvalStatus === ApprovalStatus.PENDING && (
        <>
          <Button
            color="success"
            onClick={() => onAction('approve')}
          >
            Approve
          </Button>
          <Button
            color="warning"
            onClick={() => onAction('approve_with_modification')}
          >
            Approve with Changes
          </Button>
          <Button
            color="error"
            onClick={() => onAction('reject')}
          >
            Reject
          </Button>
        </>
      )}

      {ride.schedulingState === SchedulingState.UNSCHEDULED && (
        <Button onClick={() => onAction('assign_driver')}>
          Assign Driver
        </Button>
      )}
    </ButtonGroup>
  );

  const renderDriverActions = () => (
    <ButtonGroup>
      {ride.timeState === TimeState.ACTIVE && (
        <>
          <Button
            variant="contained"
            onClick={() => onAction('update_status')}
          >
            Update Status
          </Button>
          <Button
            color="warning"
            onClick={() => onAction('report_issue')}
          >
            Report Issue
          </Button>
        </>
      )}
    </ButtonGroup>
  );

  const renderRiderActions = () => (
    <ButtonGroup>
      {permissions.canEdit && (
        <Button onClick={() => onAction('edit')}>
          Edit Ride
        </Button>
      )}

      {permissions.canDelete && (
        <Button
          color="error"
          onClick={() => onAction('delete')}
        >
          Cancel Ride
        </Button>
      )}
    </ButtonGroup>
  );

  switch (userRole) {
    case 'admin':
      return renderAdminActions();
    case 'driver':
      return renderDriverActions();
    case 'rider':
      return renderRiderActions();
    default:
      return null;
  }
};
```

### 2.8. CRUD Operations and Workflow Management

#### 2.8.1. Three-Tier CRUD Operation Interface

The frontend implements sophisticated CRUD operations that handle the complexity of single rides, recurring series, and the relationships between virtual and physical rides:

```typescript
interface CRUDOperationModal {
  targetRide: UnifiedRide;
  operationType: CRUDOperationType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (changes: any) => void;
}

const CRUDOperationModal: React.FC<CRUDOperationModal> = ({
  targetRide,
  operationType,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [changes, setChanges] = useState<Partial<UnifiedRide>>({});
  const [impactAnalysis, setImpactAnalysis] = useState<OperationImpact | null>(null);

  // Calculate impact of the operation
  useEffect(() => {
    if (isOpen) {
      calculateOperationImpact(targetRide, operationType, changes)
        .then(setImpactAnalysis);
    }
  }, [targetRide, operationType, changes, isOpen]);

  const renderOperationScope = () => {
    switch (operationType) {
      case CRUDOperationType.SINGLE:
        return (
          <Alert severity="info">
            This will only affect this specific ride occurrence.
          </Alert>
        );

      case CRUDOperationType.THIS_AND_FOLLOWING:
        return (
          <Alert severity="warning">
            This will split the recurring series. All rides from this date forward will be affected.
            <Typography variant="caption" display="block">
              Affected rides: {impactAnalysis?.affectedRideCount || 0}
            </Typography>
          </Alert>
        );

      case CRUDOperationType.ALL:
        return (
          <Alert severity="error">
            This will affect the entire recurring series.
            <Typography variant="caption" display="block">
              Total rides in series: {impactAnalysis?.totalRideCount || 0}
            </Typography>
          </Alert>
        );
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {getOperationTitle(operationType)} Ride
      </DialogTitle>

      <DialogContent>
        {renderOperationScope()}

        <RideEditForm
          ride={targetRide}
          changes={changes}
          onChange={setChanges}
          operationType={operationType}
        />

        {impactAnalysis && (
          <OperationImpactPreview impact={impactAnalysis} />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm(changes)}
          variant="contained"
          color={getOperationColor(operationType)}
        >
          Confirm {getOperationTitle(operationType)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

#### 2.8.2. Virtual Ride Materialization Workflow

```typescript
const VirtualRideMaterializationModal: React.FC<{
  virtualRide: VirtualRide;
  isOpen: boolean;
  onClose: () => void;
  onMaterialize: (physicalRide: PhysicalRide) => void;
}> = ({ virtualRide, isOpen, onClose, onMaterialize }) => {
  const [changes, setChanges] = useState<Partial<PhysicalRide>>({});
  const [materializationType, setMaterializationType] = useState<PhysicalRideType>();
  const { materializeVirtualRide, isProcessing, currentStep } = useMaterializationWorkflow();

  // Determine materialization type based on changes
  useEffect(() => {
    const type = determineMaterializationType(changes);
    setMaterializationType(type);
  }, [changes]);

  const handleMaterialize = async () => {
    try {
      const physicalRide = await materializeVirtualRide(virtualRide, changes);
      onMaterialize(physicalRide);
      onClose();
    } catch (error) {
      console.error('Materialization failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Materialize Virtual Ride
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Converting this virtual ride to a physical ride instance.
        </Alert>

        <VirtualRidePreview ride={virtualRide} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Modifications (Optional)
        </Typography>

        <RideEditForm
          ride={virtualRide}
          changes={changes}
          onChange={setChanges}
          mode="materialization"
        />

        {materializationType && (
          <MaterializationTypeIndicator type={materializationType} />
        )}

        {isProcessing && (
          <MaterializationProgress currentStep={currentStep} />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleMaterialize}
          variant="contained"
          disabled={isProcessing}
        >
          {isProcessing ? 'Materializing...' : 'Materialize Ride'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 2.9. Calendar and Schedule Visualization

#### 2.9.1. Unified Calendar Interface

```typescript
const UnifiedRideCalendar: React.FC = () => {
  const { physicalRides } = usePhysicalRides();
  const { rideSeries } = useRideSeries();
  const [viewDate, setViewDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');

  // Generate virtual rides for the current view period
  const virtualRides = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);

    return rideSeries.flatMap(series =>
      generateVirtualRidesForPeriod(series, start, end)
    );
  }, [rideSeries, viewDate]);

  // Combine and deduplicate rides (virtual rides are hidden if physical exists)
  const allRides = useMemo(() => {
    const physicalRidesByDate = new Set(
      physicalRides.map(ride =>
        `${ride.rideSeriesId}-${ride.startTime.split('T')[0]}`
      )
    );

    const filteredVirtualRides = virtualRides.filter(vRide =>
      !physicalRidesByDate.has(`${vRide.rideSeriesId}-${vRide.startTime.split('T')[0]}`)
    );

    return [...physicalRides, ...filteredVirtualRides];
  }, [physicalRides, virtualRides]);

  const calendarEvents = allRides.map(ride => ({
    id: ride.id,
    title: `${ride.rider?.firstName} ${ride.rider?.lastName}`,
    start: new Date(ride.startTime),
    end: new Date(ride.endTime),
    resource: ride,
    className: getCalendarEventClass(ride)
  }));

  return (
    <Box>
      <CalendarToolbar
        viewType={viewType}
        onViewTypeChange={setViewType}
        viewDate={viewDate}
        onViewDateChange={setViewDate}
      />

      <Calendar
        localizer={localizer}
        events={calendarEvents}
        view={viewType}
        date={viewDate}
        onNavigate={setViewDate}
        onView={setViewType}
        eventPropGetter={getEventProps}
        components={{
          event: RideEventComponent,
          toolbar: false // Custom toolbar above
        }}
        style={{ height: 600 }}
      />

      <CalendarLegend />
    </Box>
  );
};
```

#### 2.9.2. Role-Specific Calendar Views

```typescript
const RoleSpecificCalendarView: React.FC = () => {
  const { userRole } = usePermissions();
  const { currentUser } = useGlobalState();

  switch (userRole) {
    case 'admin':
      return <AdminCalendarView />;
    case 'driver':
      return <DriverCalendarView driverId={currentUser.id} />;
    case 'rider':
      return <RiderCalendarView riderId={currentUser.id} />;
    default:
      return <UnauthorizedView />;
  }
};

const DriverCalendarView: React.FC<{ driverId: string }> = ({ driverId }) => {
  const assignedRides = useDriverRides(driverId);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayRides = assignedRides.filter(ride =>
    isSameDay(new Date(ride.startTime), selectedDate)
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper>
          <Calendar
            events={assignedRides.map(ride => ({
              id: ride.id,
              title: `${ride.rider?.firstName} ${ride.rider?.lastName}`,
              start: new Date(ride.startTime),
              end: new Date(ride.endTime),
              resource: ride
            }))}
            selectable
            onSelectSlot={({ start }) => setSelectedDate(start)}
            components={{
              event: DriverRideEventComponent
            }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Typography>

          {todayRides.length === 0 ? (
            <Typography color="text.secondary">
              No rides scheduled for this day
            </Typography>
          ) : (
            <List>
              {todayRides.map(ride => (
                <DriverRideListItem key={ride.id} ride={ride} />
              ))}
            </List>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
```

### 2.10. Error Handling and User Feedback

#### 2.10.1. Comprehensive Error Handling Strategy

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RideSystemErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

#### 2.10.2. User Feedback and Notification System

```typescript
interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const useNotifications = (): NotificationState => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after timeout (except for errors)
    if (notification.severity !== 'error') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.autoHideDuration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <Stack spacing={1} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      {notifications.map(notification => (
        <Alert
          key={notification.id}
          severity={notification.severity}
          onClose={() => removeNotification(notification.id)}
          action={
            notification.action && (
              <Button size="small" onClick={notification.action.handler}>
                {notification.action.label}
              </Button>
            )
          }
        >
          <AlertTitle>{notification.title}</AlertTitle>
          {notification.message}
        </Alert>
      ))}
    </Stack>
  );
};
```

### 2.11. Performance Optimization and Scalability

#### 2.11.1. Virtual Scrolling for Large Datasets

```typescript
const VirtualizedRideTable: React.FC<{
  rides: UnifiedRide[];
  height: number;
}> = ({ rides, height }) => {
  const rowHeight = 80;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const containerHeight = height;
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight) + 1,
      rides.length
    );

    return rides.slice(startIndex, endIndex).map((ride, index) => ({
      ride,
      index: startIndex + index
    }));
  }, [rides, scrollTop, height, rowHeight]);

  return (
    <Box
      sx={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <Box sx={{ height: rides.length * rowHeight, position: 'relative' }}>
        {visibleItems.map(({ ride, index }) => (
          <Box
            key={ride.id}
            sx={{
              position: 'absolute',
              top: index * rowHeight,
              left: 0,
              right: 0,
              height: rowHeight
            }}
          >
            <RideTableRow ride={ride} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
```

#### 2.11.2. Efficient State Updates and Memoization

```typescript
const OptimizedRideList: React.FC<{
  rides: UnifiedRide[];
  filters: RideFilters;
}> = ({ rides, filters }) => {
  // Memoize filtered and sorted rides
  const processedRides = useMemo(() => {
    let filtered = rides;

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(ride => ride.operationalStatus === filters.status);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(ride =>
        isWithinInterval(new Date(ride.startTime), filters.dateRange!)
      );
    }

    if (filters.riderName) {
      filtered = filtered.filter(ride =>
        ride.rider?.firstName.toLowerCase().includes(filters.riderName!.toLowerCase()) ||
        ride.rider?.lastName.toLowerCase().includes(filters.riderName!.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'startTime':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case 'status':
          return a.operationalStatus.localeCompare(b.operationalStatus);
        default:
          return 0;
      }
    });
  }, [rides, filters]);

  // Memoize ride components to prevent unnecessary re-renders
  const memoizedRideComponents = useMemo(() =>
    processedRides.map(ride => (
      <MemoizedRideCard key={ride.id} ride={ride} />
    )),
    [processedRides]
  );

  return (
    <Box>
      {memoizedRideComponents}
    </Box>
  );
};

const MemoizedRideCard = React.memo<{ ride: UnifiedRide }>(({ ride }) => (
  <RideCard ride={ride} />
), (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when ride data hasn't changed
  return (
    prevProps.ride.id === nextProps.ride.id &&
    prevProps.ride.operationalStatus === nextProps.ride.operationalStatus &&
    prevProps.ride.schedulingState === nextProps.ride.schedulingState &&
    prevProps.ride.approvalStatus === nextProps.ride.approvalStatus
  );
});
```

### 2.12. Testing Strategy

#### 2.12.1. Component Testing Approach

```typescript
// Test utilities for ride system components
export const createMockPhysicalRide = (overrides: Partial<PhysicalRide> = {}): PhysicalRide => ({
  id: 'ride-123',
  riderId: 'rider-456',
  driverId: 'driver-789',
  startLocationId: 'loc-1',
  endLocationId: 'loc-2',
  startTime: '2025-09-20T09:00:00Z',
  endTime: '2025-09-20T10:00:00Z',
  approvalStatus: ApprovalStatus.APPROVED,
  schedulingState: SchedulingState.SCHEDULED,
  operationalStatus: OperationalStatus.NOT_STARTED,
  timeState: TimeState.UPCOMING,
  physicalRideType: PhysicalRideType.STANDALONE,
  isPhysical: true,
  canEdit: true,
  canDelete: true,
  availableActions: ['edit', 'delete'],
  ...overrides
});

export const createMockVirtualRide = (overrides: Partial<VirtualRide> = {}): VirtualRide => ({
  id: 'virtual-123',
  riderId: 'rider-456',
  rideSeriesId: 'series-789',
  startLocationId: 'loc-1',
  endLocationId: 'loc-2',
  startTime: '2025-09-21T09:00:00Z',
  endTime: '2025-09-21T10:00:00Z',
  approvalStatus: ApprovalStatus.APPROVED,
  schedulingState: SchedulingState.UNSCHEDULED,
  operationalStatus: OperationalStatus.NOT_STARTED,
  timeState: TimeState.UPCOMING,
  isVirtual: true,
  canMaterialize: true,
  materializationTriggers: ['assign_driver', 'edit_details'],
  ...overrides
});

// Test for ride materialization workflow
describe('VirtualRideMaterializationModal', () => {
  it('should materialize virtual ride with no changes as Manual-Generated', async () => {
    const mockVirtualRide = createMockVirtualRide();
    const mockOnMaterialize = jest.fn();

    render(
      <VirtualRideMaterializationModal
        virtualRide={mockVirtualRide}
        isOpen={true}
        onClose={() => {}}
        onMaterialize={mockOnMaterialize}
      />
    );

    const materializeButton = screen.getByRole('button', { name: /materialize ride/i });
    fireEvent.click(materializeButton);

    await waitFor(() => {
      expect(mockOnMaterialize).toHaveBeenCalledWith(
        expect.objectContaining({
          physicalRideType: PhysicalRideType.MANUAL_GENERATED,
          rideSeriesId: mockVirtualRide.rideSeriesId
        })
      );
    });
  });

  it('should materialize virtual ride with virtual feature changes as Orphaned', async () => {
    const mockVirtualRide = createMockVirtualRide();
    const mockOnMaterialize = jest.fn();

    render(
      <VirtualRideMaterializationModal
        virtualRide={mockVirtualRide}
        isOpen={true}
        onClose={() => {}}
        onMaterialize={mockOnMaterialize}
      />
    );

    // Change start time (virtual feature)
    const startTimeInput = screen.getByLabelText(/start time/i);
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    const materializeButton = screen.getByRole('button', { name: /materialize ride/i });
    fireEvent.click(materializeButton);

    await waitFor(() => {
      expect(mockOnMaterialize).toHaveBeenCalledWith(
        expect.objectContaining({
          physicalRideType: PhysicalRideType.ORPHANED,
          rideSeriesId: null // Orphaned rides have no series link
        })
      );
    });
  });
});
```

#### 2.12.2. Integration Testing for CRUD Operations

```typescript
describe('CRUD Operations Integration', () => {
  it('should handle This and Following operation correctly', async () => {
    const mockRideSeries = createMockRideSeries();
    const mockVirtualRide = createMockVirtualRide({
      rideSeriesId: mockRideSeries.id,
      startTime: '2025-09-22T09:00:00Z'
    });

    // Mock API responses
    mockAxios.onPut(`/api/ride-series/${mockRideSeries.id}/split`).reply(200, {
      originalSeries: { ...mockRideSeries, seriesEndDate: '2025-09-21' },
      newSeries: { ...mockRideSeries, id: 'new-series-id', seriesStartDate: '2025-09-22' }
    });

    render(
      <TestProvider>
        <CRUDOperationModal
          targetRide={mockVirtualRide}
          operationType={CRUDOperationType.THIS_AND_FOLLOWING}
          isOpen={true}
          onClose={() => {}}
          onConfirm={jest.fn()}
        />
      </TestProvider>
    );

    // Make changes to the ride
    const startTimeInput = screen.getByLabelText(/start time/i);
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAxios.history.put).toHaveLength(1);
      expect(mockAxios.history.put[0].url).toBe(`/api/ride-series/${mockRideSeries.id}/split`);
    });
  });
});
```

### 2.13. Deployment and Build Considerations

#### 2.13.1. Environment Configuration

```typescript
// Environment-specific configurations
interface AppConfig {
  apiBaseUrl: string;
  websocketUrl: string;
  enableRealTimeUpdates: boolean;
  recurrencePreviewLimit: number;
  virtualRideGenerationWindow: number; // days
  cacheSettings: {
    rideDataTTL: number;
    userDataTTL: number;
  };
}

const config: Record<string, AppConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3001',
    websocketUrl: 'http://localhost:3001',
    enableRealTimeUpdates: true,
    recurrencePreviewLimit: 50,
    virtualRideGenerationWindow: 90,
    cacheSettings: {
      rideDataTTL: 5 * 60 * 1000, // 5 minutes
      userDataTTL: 30 * 60 * 1000 // 30 minutes
    }
  },
  production: {
    apiBaseUrl: process.env.REACT_APP_API_URL!,
    websocketUrl: process.env.REACT_APP_WS_URL!,
    enableRealTimeUpdates: true,
    recurrencePreviewLimit: 100,
    virtualRideGenerationWindow: 180,
    cacheSettings: {
      rideDataTTL: 15 * 60 * 1000, // 15 minutes
      userDataTTL: 60 * 60 * 1000 // 1 hour
    }
  }
};
```

#### 2.13.2. Build Optimization

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "build:optimized": "GENERATE_SOURCEMAP=false npm run build"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### 2.14. Migration Strategy from Current System

#### 2.14.1. Incremental Migration Approach

The migration from the current simplified ride system to the new complex system will be implemented in phases:

**Phase 1: Type System and Core Infrastructure**
- Update type definitions to support new ride models
- Implement new state management contexts
- Create backward compatibility layer

**Phase 2: RideSeries and Virtual Ride Support**
- Add RideSeries management components
- Implement virtual ride generation
- Create materialization workflows

**Phase 3: Enhanced CRUD Operations**
- Implement three-tier CRUD operations
- Add operation impact analysis
- Update permission system

**Phase 4: Real-time Features**
- Add WebSocket integration
- Implement live status updates
- Add real-time notifications

**Phase 5: Advanced Recurrence Features**
- Full RFC 5545 support
- Advanced calendar views
- Exception date management

#### 2.14.2. Data Migration Utilities

```typescript
const migrateExistingRides = async (legacyRides: LegacyRide[]): Promise<MigrationResult> => {
  const migrationResults: MigrationResult = {
    totalProcessed: 0,
    successfulMigrations: 0,
    errors: []
  };

  for (const legacyRide of legacyRides) {
    try {
      if (legacyRide.isRecurring) {
        // Convert recurring ride to RideSeries + Physical rides
        const rideSeries = await createRideSeriesFromLegacy(legacyRide);
        const physicalRides = await createPhysicalRidesFromLegacy(legacyRide, rideSeries.id);

        migrationResults.successfulMigrations += 1 + physicalRides.length;
      } else {
        // Convert single ride to standalone Physical ride
        const physicalRide = await createStandaloneRideFromLegacy(legacyRide);
        migrationResults.successfulMigrations += 1;
      }

      migrationResults.totalProcessed += 1;
    } catch (error) {
      migrationResults.errors.push({
        rideId: legacyRide.id,
        error: error.message
      });
    }
  }

  return migrationResults;
};
```

---

## Conclusion

This frontend design document provides a comprehensive blueprint for implementing the complex Carriage Ride System. The architecture supports:

- **Virtual and Physical Ride Management**: Seamless handling of both virtual ride calculations and physical ride instances
- **Complex Recurrence Patterns**: Full RFC 5545 compliance with advanced recurrence rule building
- **Real-time Operations**: Live status updates and operational management
- **Role-based Permissions**: Sophisticated permission system with UI adaptations
- **Three-tier CRUD Operations**: Single, This and Following, and All operation types
- **Materialization Workflows**: Smooth transitions from virtual to physical rides
- **Scalable Architecture**: Performance optimizations for large datasets and complex operations

The implementation prioritizes user experience while maintaining the technical sophistication required to handle the complex business logic of the ride system. Each component is designed to be maintainable, testable, and extensible for future enhancements.
