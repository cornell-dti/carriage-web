import { RiderType } from '../../../server/models/rider';
import { DriverType } from '../../../server/models/driver';
import { RideType } from '../../../server/models/ride';
import { AdminType } from '../../../server/models/admin';
import { LocationType } from '../../../server/models/location';
import { VehicleType } from '../../../server/models/vehicle';

export type Rider = RiderType;

export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
}

export type Availability = {
  startTime: string;
  endTime: string;
};

export type AvailabilityType = {
  [day: string]: Availability;
};

export type Driver = DriverType;

export type Admin = AdminType;

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  availability?: AvailabilityType;
  admin?: boolean;
  photoLink?: string;
  startDate?: string;
};

export type ObjectType = {
  [x: string]: any;
}

export type Vehicle = VehicleType;

export enum Tag {
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom'
}

export type Location = LocationType;

export type Ride = RideType;
