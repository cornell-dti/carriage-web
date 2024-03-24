import { RiderType } from '../../../server/src/models/rider';
import { DriverType } from '../../../server/src/models/driver';
import { RideType } from '../../../server/src/models/ride';
import { AdminType } from '../../../server/src/models/admin';
import { LocationType } from '../../../server/src/models/location';
import { VehicleType } from '../../../server/src/models/vehicle';

export type Rider = RiderType;

export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animals',
  OTHER = 'Other',
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
  type?: string[];
  isDriver?: boolean;
  phoneNumber: string;
  email: string;
  availability?: AvailabilityType;
  photoLink?: string;
  startDate?: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
};

export type ObjectType = {
  [x: string]: any;
};

export type Vehicle = VehicleType;

export enum Tag {
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
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

export enum RepeatValues {
  DoesNotRepeat = 'Does Not Repeat',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Custom = 'Custom',
}
