import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import defaultModelConfig from '../util/modelConfig';

export type AdminRole = 'sds-admin' | 'redrunner-admin';

export type AdminType = {
  id: string;
  firstName: string;
  lastName: string;
  type: AdminRole[];
  isDriver: boolean;
  phoneNumber: string;
  email: string;
  photoLink?: string;
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
  type: {
    type: Array,
    schema: [String],
    required: true,
  },
  isDriver: {
    type: Boolean,
    required: true,
    default: false,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: /^[0-9]{10}$/,
  },
  email: {
    type: String,
    required: true,
    validate: (email) => isEmail(email as string),
  },
  photoLink: String,
});

export const Admin = dynamoose.model('Admins', schema, defaultModelConfig);
