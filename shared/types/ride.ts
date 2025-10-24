import { DriverType } from './driver';
import { LocationType } from './location';
import { RiderType } from './rider';

// Scheduling state - separate from operational status
export enum SchedulingState {
  SCHEDULED = 'scheduled',
  UNSCHEDULED = 'unscheduled',
}

// Operational status
export enum Status {
  NOT_STARTED = 'not_started',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export enum Type {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ACTIVE = 'active',
}

export type RecurrenceData = {
  id: string;
  breaksRecurrence: boolean;
};

export type RideType = {
  id: string;
  type: Type;
  status: Status;
  schedulingState: SchedulingState;
  startLocation: LocationType;
  endLocation: LocationType;
  startTime: string;
  endTime: string;
  riders: RiderType[];
  driver?: DriverType;

  // RFC 5545 Recurrence fields (placeholders - no functionality yet)
  isRecurring: boolean;
  rrule?: string; // RFC 5545 recurrence rule
  exdate?: string[]; // Excluded dates (ISO 8601 format)
  rdate?: string[]; // Additional dates (ISO 8601 format)
  parentRideId?: string; // Reference to parent ride for series
  recurrenceId?: string; // Original start time for overrides
  timezone?: string; // Timezone for recurrence calculations
};

/* TODO: Create new type `RideType2` that contains
- id
- riders
- driver?
- requestedPickupTime
- finalPickupTime?
- requestedDropoffTime
- finalDropoffTime?
- requestedPickupLocation
- finalPickupLocation?
- requestedDropoffLocation
- finalDropoffLocation?
- schedulingState: create type
- operationalStatus: create type
- recurrenceId?
- breaksRecurrence?
*/
