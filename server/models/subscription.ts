import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';
import { Admin, AdminType } from './admin';
import { Driver, DriverType } from './driver';
import { Rider, RiderType } from './rider';

export enum UserType {
  ADMIN = 'admin',
  RIDER = 'rider',
  DRIVER = 'driver',
  USER = 'user'
}

export enum PlatformType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios'
}

export type SubscriptionType = {
  id: string; // endpoint + user type + platform type
  endpoint: string;
  userType: UserType;
  platform: PlatformType;
  timeAdded: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
  user?: {
    admin?: AdminType;
    driver?: DriverType;
    rider?: RiderType;
  };
  preferences: string[];
};

const schema = new dynamoose.Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: Object.values(UserType),
    required: true,
  },
  platform: {
    type: String,
    enum: Object.values(PlatformType),
    required: true,
  },
  timeAdded: {
    type: String,
    required: true,
    validate: (time) => isISO8601(time as string),
  },
  keys: {
    type: Object,
    schema: {
      p256dh: String,
      auth: String,
    },
  },
  user: {
    type: Object,
    schema: {
      admin: Admin,
      driver: Driver,
      rider: Rider,
    },
  },
  preferences: {
    type: Array,
    schema: [String],
    default: [],
  },
});

export const Subscription = dynamoose.model('Subscriptions', schema); // , { create: false }
