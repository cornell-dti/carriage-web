// Define day of week enum
export enum DayOfWeek {
  MONDAY = 'MON',
  TUESDAY = 'TUE',
  WEDNESDAY = 'WED',
  THURSDAY = 'THURS',
  FRIDAY = 'FRI',
}

export type DriverType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  photoLink?: string;
  availability: DayOfWeek[];
  active?: boolean;
  joinDate?: string;
};
