import { DayOfWeek } from '@carriage-web/shared/types/driver';

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
