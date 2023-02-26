import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import { formatAddress, isAddress } from '../util';

export enum Accessibility {
  NONE = '',
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animals',
  OTHER = 'Other',
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift',
}

export type RiderType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessibility?: string;
  organization?: Organization;
  description?: string;
  joinDate: string;
  endDate: string;
  pronouns?: string;
  address: string;
  favoriteLocations: string[];
  photoLink?: string;
  active: boolean;
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
  accessibility: {
    type: String,
    enum: Object.values(Accessibility),
    required: false,
  },
  organization: {
    type: String,
    enum: Object.values(Organization),
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  joinDate: {
    type: String,
    required: true,
    validate: /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
  },
  endDate: {
    type: String,
    required: true,
    validate: /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
  },
  pronouns: {
    type: String,
    required: false,
    validate: /^\w*\/\w*\/\w*$/,
  },
  address: {
    type: String,
    required: true,
    set: (address) => formatAddress(address as string),
    validate: (address) => isAddress(address as string),
  },
  favoriteLocations: {
    type: Array,
    required: false,
    schema: [String],
    default: [],
  },
  photoLink: String,
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export const Rider = dynamoose.model('Riders', schema, { create: false });
