import { Status } from '@carriage-web/shared/types/ride';

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
  CREATED = 'created',
  REASSIGN_DRIVER = 'reassign_driver',
  CANCELLED = 'cancelled',
}

export type NotificationEvent = Change | Status;
