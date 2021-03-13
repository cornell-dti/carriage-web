import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { ValueType } from 'dynamoose/dist/Schema';
import { ObjectType } from 'dynamoose/dist/General';
import { Location, Tag } from './location';
import { Rider, RiderType } from './rider';
import { Driver, DriverType } from './driver';
import { formatAddress, isAddress } from '../util';

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

export type RideLocation = {
  id?: string,
  name: string;
  address: string;
  tag: Tag;
  info: string;
};

export type RideType = {
  id: string,
  type: Type,
  status: Status,
  late: boolean,
  startLocation: RideLocation,
  endLocation: RideLocation,
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

const locationSchema = {
  type: [String, Object],
  required: true,
  get: (value: ValueType) => {
    if (typeof value === 'string') {
      return Location.get(value) as any;
    }
    return value;
  },
  schema: {
    name: String,
    address: {
      type: String,
      set: (address: any) => formatAddress(address as string),
      validate: (address: any) => isAddress(address as string),
    },
    tag: {
      type: String,
      enum: Object.values(Tag),
    },
    info: String,
  },
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
  startLocation: locationSchema,
  endLocation: locationSchema,
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
  rider: Rider as any,
  driver: Driver as any,
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
  endDate: {
    type: String,
    required: false,
    validate: /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
  },
});

export const Ride = dynamoose.model('Rides', schema, { create: false });
