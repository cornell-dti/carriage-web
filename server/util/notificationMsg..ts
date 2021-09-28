import { UserType } from '../models/subscription';
import { Change } from './types';
import { RideType, Status } from '../models/ride';

export const getNotificationMessage = (
  sendingUser: UserType,
  receivingUser: UserType,
  change: Change | Status,
  body: Partial<RideType>
) => {};
