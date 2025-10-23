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

export type RecurrenceData = {
  id: string;
  breaksRecurrence: boolean;
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
