import dynamoose from 'dynamoose';

// only an admin should be able to add another dispatcher
export enum AccessLevel {
  ADMIN = 'Admin',
  SDS = 'SDS',
  DISPATCHER = 'Dispatcher',
}

export type DispatcherType = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessLevel: AccessLevel,
  photoLink?: string,
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessLevel: {
    type: String,
    enum: Object.values(AccessLevel),
  },
  photoLink: String,
});

export const Dispatcher = dynamoose.model('Dispatchers', schema, { create: false });
