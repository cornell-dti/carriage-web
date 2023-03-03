import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import defaultModelConfig from '../util/modelConfig';

export type AdminType = {
  id: string;
  firstName: string;
  lastName: string;
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
