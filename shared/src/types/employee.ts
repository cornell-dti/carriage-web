import { DayOfWeek } from './driver';

export type EmployeeType = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  photoLink?: string;
  isAdmin: boolean;
  adminRoles: string[];
  isDriver: boolean;
  availability: DayOfWeek[];
  active?: boolean;
  joinDate?: string;
};
