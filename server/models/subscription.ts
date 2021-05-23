import dynamoose from 'dynamoose';
import isISO8601 from 'validator/lib/isISO8601';

export enum UserType {
  ADMIN = 'Admin',
  RIDER = 'Rider',
  DRIVER = 'Driver'
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
  userId: string;
  platform: PlatformType;
  timeAdded: string;
  keys?: {
    p256dh: string;
    auth: string;
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
  userId: {
    type: String,
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
  preferences: {
    type: Array,
    required: true,
    schema: [String],
    default: [],
  },
});

export const Subscription = dynamoose.model('Subscriptions', schema); // , { create: false }
