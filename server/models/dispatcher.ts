import dynamoose from 'dynamoose';

// only an admin should be able to add another dispatcher
type AccessLevel = 'Admin' | 'SDS' | 'Dispatcher'

export type DispatcherType = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessLevel: AccessLevel
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessLevel: {
    type: String,
    enum: ['Admin', 'SDS', 'Dispatcher'],
  },
});

export const Dispatcher = dynamoose.model('Dispatchers', schema, { create: false });
