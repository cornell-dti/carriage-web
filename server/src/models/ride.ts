import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { Tag } from './location';
import { Rider, RiderType } from './rider';
import { Driver, DriverType } from './driver';
import { getRideLocation } from '../util';
import defaultModelConfig from '../util/modelConfig';

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
  CANCELLED = 'cancelled',
}

export type RideLocation = {
  id?: string;
  name: string;
  address: string;
  tag: Tag;
};

export type RideType = {
  id: string;
  type: Type;
  status: Status;
  late: boolean;
  startLocation: RideLocation;
  endLocation: RideLocation;
  startTime: string;
  endTime: string;
  rider: RiderType;
  driver?: DriverType;
  recurring: boolean;
  recurringDays?: number[];
  endDate?: string;
  //ride data should be as similar to sourceRide as possible
  
  sourceRide? : RideType;
  parentRide? : RideType; 
  parentRideId? : string;
  childRide? : RideType; 
  childRideId? : string;
};

const locationSchema = {
  type: [String, Object],
  required: true,
  get: getRideLocation,
  schema: {
    name: String,
    address: {
      type: String,
    },
    tag: {
      type: String,
      enum: Object.values(Tag),
    },
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
  endTime: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  rider: Rider,
  driver: Driver,
  recurring: {
    type: Boolean,
    required: true,
    default: false,
  },
  recurringDays: {
    type: Array,
    schema: [Number],
  },
  deleted: {
    type: Array,
    schema: [String],
  },
  edits: {
    type: Array,
    schema: [String],
  },
  endDate: {
    type: String,
    required: false,
    validate: /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
  },
  parentRideId : {
    type : String, 
    required : false,
    hashKey: true
  }, 
  childrenRideId : {
    type : String, 
    required : false,
    hashKey: true
  }, 
});

export const Ride = dynamoose.model('Rides', schema, defaultModelConfig);
