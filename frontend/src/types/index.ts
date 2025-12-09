import { VehicleType } from '../../../server/src/models/vehicle';
import { UnregisteredUserType } from '../../../server/src/util/types';

export enum Accessibility {
  ASSISTANT = 'Assistant',
  CRUTCHES = 'Crutches',
  WHEELCHAIR = 'Wheelchair',
  MOTOR_SCOOTER = 'Motorized Scooter',
  KNEE_SCOOTER = 'Knee Scooter',
  LOW_VISION = 'Low Vision/Blind',
  SERVICE_ANIMALS = 'Service Animal',
}

export enum DayOfWeek {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THURS',
  FRIDAY = 'FRI',
}

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  type?: string[];
  isDriver?: boolean;
  phoneNumber: string;
  email: string;
  availability?: DayOfWeek[];
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
  EAST = 'east',
  CENTRAL = 'central',
  NORTH = 'north',
  WEST = 'west',
  CTOWN = 'ctown',
  DTOWN = 'dtown',
  INACTIVE = 'inactive',
  CUSTOM = 'custom',
}

export enum Type {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ACTIVE = 'active',
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

// Scheduling state - separate from operational status
export enum SchedulingState {
  SCHEDULED = 'scheduled',
  UNSCHEDULED = 'unscheduled',
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

export type UnregisteredUser = UnregisteredUserType;
