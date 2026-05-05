import { DriverType } from './driver';
import { LocationType } from './location';
import { RiderType } from './rider';

export enum Type {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ACTIVE = 'active',
}

// Scheduling state - separate from operational status
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

// Use the proper LocationType instead of custom RideLocation

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

  isRecurring: boolean;
  recurrenceId?: string; // Shared UUID for all rides in a series
  recurrenceDays?: number[]; // Days of week: 0=Sun, 1=Mon, ..., 6=Sat
  recurrenceEndDate?: string; // ISO date string — last date for the series
  timezone?: string;
};
