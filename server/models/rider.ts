import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import { formatAddress, isAddress } from '../util';


export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift'
}

export type RiderType = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  accessibility: Accessibility[]
  organization?: Organization
  description?: string
  joinDate: string
  endDate: string
  pronouns?: string
  address: string
  favoriteLocations: string[]
  photoLink?: string
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
    type: Array,
    schema: [String],
    required: true,
  },
  organization: {
    type: String,
    enum: Object.values(Organization),
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  joinDate: {
    type: String,
    required: true,
    validate: /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
  },
  endDate: {
    type: String,
    required: true,
    validate: /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/,
  },
  pronouns: {
    type: String,
    required: true,
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
    required: true,
    schema: [String],
    default: [],
  },
  photoLink: String,
});

export const Rider = dynamoose.model('Riders', schema, { create: false });
