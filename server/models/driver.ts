import dynamoose from 'dynamoose';
import { Vehicle, VehicleType } from './vehicle';

type Availability = {
  startTime: string,
  endTime: string,
}

type AvailabilityType = {
  Mon?: Availability,
  Tue?: Availability,
  Wed?: Availability,
  Thu?: Availability,
  Fri?: Availability,
}

export type DriverType = {
  id: string,
  firstName: string,
  lastName: string,
  availability: AvailabilityType,
  vehicle: VehicleType,
  phoneNumber: string,
  email: string,
  photoLink?: string,
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
  id: String,
  firstName: String,
  lastName: String,
  availability: {
    type: Object,
    schema: availabilitySchema,
  },
  vehicle: Vehicle as any,
  phoneNumber: String,
  email: String,
  photoLink: String,
});

export const Driver = dynamoose.model('Drivers', schema, { create: false });
