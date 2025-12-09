import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import defaultModelConfig from '../util/modelConfig';
import { DayOfWeek } from '@carriage-web/shared/src/types/driver';

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
  availability: {
    type: Array,
    schema: [String],
    default: [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
    ],
  },
  active: {
    type: Boolean,
    default: true,
  },
  joinDate: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

export const Driver = dynamoose.model('Drivers', schema, defaultModelConfig);
