import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';

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
  accessLevel: AccessLevel
};

const schema = new dynamoose.Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: /[0-9]{10}/,
  },
  email: {
    type: String,
    required: true,
    validate: (email) => isEmail(email as string),
  },
  accessLevel: {
    type: String,
    required: true,
    enum: Object.values(AccessLevel),
  },
});

export const Dispatcher = dynamoose.model('Dispatchers', schema, { create: false });
