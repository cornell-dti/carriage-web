import { Status } from '../models/ride';

export type UserType = 'User' | 'Rider' | 'Driver' | 'Admin';

export type JWTPayload = {
  id: string;
  userType: UserType;
  iat: string;
};

export enum Change {
  LATE = 'late',
  SCHEDULED = 'scheduled',
  EDITED = 'edited',
  REPEATING_EDITED = 'repeating_edited',
}

export type NotificationEvent = Change | Status;
