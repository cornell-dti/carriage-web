import dynamoose from 'dynamoose';

export type NotificationType = {
  endpoint: string,
  p256dh: string,
  auth: string,
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
  p256dh: {
    type: String,
    required: true,
  },
  auth: {
    type: String,
    required: true,
  },
});

export const Notification = dynamoose.model('Notifications', schema);// , { create: false }
