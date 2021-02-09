import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { Location, LocationType } from './location';
import { Rider, RiderType } from './rider';
import { Driver, DriverType } from './driver';

export enum Type {
  ACTIVE = 'active',
  PAST = 'past',
  UNSCHEDULED = 'unscheduled',
}

export enum Status {
  NOT_STARTED = 'not_started',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export type RideType = {
  id: string,
  type: Type,
  status: Status,
  late: boolean,
  startLocation: LocationType,
  endLocation: LocationType,
  startTime: string,
  requestedEndTime: string,
  endTime?: string,
  rider: RiderType,
  driver?: DriverType,
  recurring: boolean,
  recurringDays?: number[],
  endDate?: string
  deleted?: boolean,
  edits?: string[],
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
  late: {
    type: Boolean,
    default: false,
    required: true,
  },
  startLocation: {
    type: Location as any,
    required: true,
  },
  endLocation: {
    type: Location as any,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  requestedEndTime: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  endTime: {
    type: String,
    validate: (time) => isISO8601(time as string),
  },
  rider: {
    type: Rider as any,
    required: true,
  },
  driver: {
    type: Driver as any,
  },
  recurring: {
    type: Boolean,
    required: true,
    default: false,
  },
  recurringDays: {
    type: Array,
    schema: [Number],
  },
  deleted: Boolean,
  edits: {
    type: Array,
    schema: [String],
  },
  endDate: String,
});

export const Ride = dynamoose.model('Rides', schema, { create: false });
