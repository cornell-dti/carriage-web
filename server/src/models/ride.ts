import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { Location } from './location';
import { SchedulingState, Status, Type } from '@carriage-web/shared/types/ride';
import { Driver } from './driver';
import defaultModelConfig from '../util/modelConfig';

// Use the proper LocationType instead of custom RideLocation

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
    default: Type.UPCOMING,
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
  riders: {
    type: Array,
    schema: [String], // Store rider IDs, not full objects
    required: true,
    default: [],
  },
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
