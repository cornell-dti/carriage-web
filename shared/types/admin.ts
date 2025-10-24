export type AdminRole = 'sds-admin' | 'redrunner-admin';

export type AdminType = {
  id: string;
  firstName: string;
  lastName: string;
  type: AdminRole[];
  isDriver: boolean;
  phoneNumber: string;
  email: string;
  photoLink?: string;
};
