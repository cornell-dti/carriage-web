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

export enum Type {
  ACTIVE = 'active',
  PAST = 'past',
  UNSCHEDULED = 'unscheduled',
}

export enum Status {
  NOT_STARTED = 'not_started',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export type TableData = {
  year: string;
  monthDay: string;
  dayCount: number;
  dayNoShow: number;
  dayCancel: number;
  nightCount: number;
  nightNoShow: number;
  nightCancel: number;
  drivers: {
    [name: string]: number;
  };
};
