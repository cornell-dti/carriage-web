import dynamoose from 'dynamoose';
import isEmail from 'validator/lib/isEmail';
import { Vehicle, VehicleType } from './vehicle';

type Availability = {
  startTime: string;
  endTime: string;
};

type AvailabilityType = {
  Mon?: Availability;
  Tue?: Availability;
  Wed?: Availability;
  Thu?: Availability;
  Fri?: Availability;
};

export type DriverType = {
  id: string;
  firstName: string;
  lastName: string;
  availability: AvailabilityType;
  vehicle: VehicleType;
  phoneNumber: string;
  startDate: string;
  email: string;
  photoLink?: string;
  admin: boolean;
};

const availability = {
  type: Object,
  schema: {
    startTime: String,
    endTime: String,
  },
};

const availabilitySchema = {
  Mon: availability,
  Tue: availability,
  Wed: availability,
  Thu: availability,
  Fri: availability,
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
  availability: {
    type: Object,
    schema: availabilitySchema,
  },
  vehicle: Vehicle,
  phoneNumber: {
    type: String,
    required: true,
    validate: /^[0-9]{10}$/,
  },
  startDate: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: (email) => isEmail(email as string),
  },
  photoLink: String,
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export const Driver = dynamoose.model('Drivers', schema, { create: false });
