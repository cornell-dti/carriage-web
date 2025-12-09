import dynamoose from 'dynamoose';
import { NotificationEvent, Change } from '../util/types';
import { Status } from '@carriage-web/shared/src/types/ride';
import defaultModelConfig from '../util/modelConfig';

export type NotificationType = {
  id: string;
  notifEvent: NotificationEvent;
  userID: string;
  rideID: string;
  title: string;
  body: string;
  timeSent: string;
  read: boolean;
};

const schema = new dynamoose.Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  userID: {
    type: String,
    required: true,
  },
  notifEvent: {
    type: String,
    enum: Object.values({ ...Change, ...Status }),
    required: true,
  },
  rideID: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timeSent: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },
});

export const Notification = dynamoose.model(
  'Notifications',
  schema,
  defaultModelConfig
);
