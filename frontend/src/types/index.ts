import { ReactNode } from 'react';
import { RiderType } from '../../../server/models/rider';

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

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  availability: AvailabilityType;
  vehicle: Vehicle;
  phoneNumber: string;
  email: string;
  phone: string;
  admin: boolean;
};

export type Admin = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  photoLink?: string;
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  availability?: AvailabilityType;
  admin?: boolean;
  photoLink?: string;
};

export type ObjectType = {
  [x: string]: any;
}

export type Vehicle = {
  id: string;
  name: string;
  capacity: string;
  wheelchairAccessible: boolean;
};

export enum Tag {
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom'
}

export type Location = {
  id: string;
  name: string;
  address: string;
  tag?: Tag;
  info?: string;
};

export type TableValue = {
  data: string | ReactNode | null;
  tag?: string;
  driver?: boolean;
  buttonHandler?: () => void;
  ButtonModal?: () => JSX.Element;
};

export type Dispatcher = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  accessLevel: string;
}
export type Ride = {
  id: string;
  type: string;
  status: string;
  late?: boolean;
  startLocation: Location;
  endLocation: Location;
  startTime: string;
  endTime: string;
  rider: Rider;
  driver?: Driver;
};
