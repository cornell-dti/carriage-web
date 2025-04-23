export interface Availability {
  startTime: string;
  endTime: string;
}

export interface AvailabilityType {
  Mon?: Availability;
  Tue?: Availability;
  Wed?: Availability;
  Thu?: Availability;
  Fri?: Availability;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  availability: AvailabilityType;
  vehicle?: Vehicle;
  phoneNumber: string;
  startDate: string;
  email: string;
  photoLink?: string;
}

export enum Organization {
  REDRUNNER = 'RedRunner',
  CULIFT = 'CULift',
}

export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animal',
}

export type Rider = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  accessibility?: Accessibility[];
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

export type AdminRole = 'sds-admin' | 'redrunner-admin';

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  type: AdminRole[];
  isDriver: boolean;
  phoneNumber: string;
  email: string;
  photoLink?: string;
}

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

export enum Tag {
  EAST = 'east',
  WEST = 'west',
  CENTRAL = 'central',
  NORTH = 'north',
  CTOWN = 'ctown', // college town
  DTOWN = 'dtown', // downtown
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}

export type Location = {
  id: string;
  name: string;
  address: string;
  tag: Tag;
  info?: string;
};

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

export type Ride = {
  id: string;
  type: Type;
  status: Status;
  late: boolean;
  startLocation: Location;
  endLocation: Location;
  startTime: Date;
  endTime: Date;
  rider: Rider;
  driver?: Driver;
  recurring: boolean;
  recurringDays?: number[];
  endDate?: Date;
  deleted?: string[];
  edits?: string[];
  parentRide?: Ride;
};

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
