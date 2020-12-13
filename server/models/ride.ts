import dynamoose from 'dynamoose';
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
  id: string;
  type: Type;
  status: Status;
  late: boolean;
  startLocation: LocationType;
  endLocation: LocationType;
  startTime: string;
  requestedEndTime: string;
  endTime: string;
  rider: RiderType;
  driver?: DriverType;
  recurring?: boolean;
  recurringDays?: number[];
  endDate?: string;
  deleted?: boolean;
  edits?: string[];
};

const schema = new dynamoose.Schema({
  id: {
    hashKey: true,
    type: String,
  },
  type: {
    type: String,
    enum: Object.values(Type),
  },
  status: {
    type: String,
    enum: Object.values(Status),
  },
  late: {
    type: Boolean,
    default: false,
  },
  startLocation: Location as any,
  endLocation: Location as any,
  startTime: String,
  requestedEndTime: String,
  endTime: String,
  rider: Rider as any,
  driver: Driver as any,
  recurring: Boolean,
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
