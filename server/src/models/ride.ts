import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { Tag, LocationType, Location } from './location';
import { Rider, RiderType } from './rider';
import { Driver, DriverType } from './driver';
import defaultModelConfig from '../util/modelConfig';

export enum Type {
  ACTIVE = 'active',
  PAST = 'past',
  UNSCHEDULED = 'unscheduled',
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
  rider: RiderType;
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


const schema = new dynamoose.Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  type: {
    type: String,
    enum: Object.values(Type),
    required: true,
    default: Type.UNSCHEDULED,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    required: true,
    default: Status.NOT_STARTED,
  },
  schedulingState: {
    type: String,
    enum: Object.values(SchedulingState),
    required: true,
    default: SchedulingState.UNSCHEDULED,
  },
  startLocation: Location,
  endLocation: Location,
  startTime: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  endTime: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  rider: Rider,
  driver: Driver,
  
  // RFC 5545 Recurrence fields (placeholders - no functionality yet)
  isRecurring: {
    type: Boolean,
    required: true,
    default: false,
  },
  rrule: {
    type: String,
    required: false,
  },
  exdate: {
    type: Array,
    schema: [String],
    required: false,
  },
  rdate: {
    type: Array,
    schema: [String],
    required: false,
  },
  parentRideId: {
    type: String,
    required: false,
  },
  recurrenceId: {
    type: String,
    required: false,
  },
  timezone: {
    type: String,
    required: false,
    default: 'America/New_York',
  },
});

export const Ride = dynamoose.model('Rides', schema, defaultModelConfig);
