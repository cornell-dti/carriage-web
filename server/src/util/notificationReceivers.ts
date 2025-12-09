import { Change, NotificationEvent } from '@carriage-web/shared/src/types';
import { UserType } from '../models/subscription';
import { Status } from '@carriage-web/shared/src/types/ride';

export const getReceivers = (
  sender: UserType,
  notifEvent: NotificationEvent,
  hasDriver: boolean
) => {
  const receivers = [];
  if (sender === UserType.RIDER) {
    // Rider
    switch (notifEvent) {
      case Change.EDITED:
      case Status.CANCELLED:
      case Change.CANCELLED:
        receivers.push(UserType.ADMIN);
        if (hasDriver) receivers.push(UserType.DRIVER);
        break;
      default:
        console.log('no notif', sender, notifEvent);
        break;
    }
  } else if (sender === UserType.DRIVER) {
    // Driver
    switch (notifEvent) {
      case Change.LATE:
      case Status.NO_SHOW:
        receivers.push(UserType.RIDER);
        receivers.push(UserType.ADMIN);
        break;
      case Status.ON_THE_WAY:
      case Status.ARRIVED:
        receivers.push(UserType.RIDER);
        break;
      default:
        console.log('no notif', sender, notifEvent);
        break;
    }
  } else {
    // Admin
    switch (notifEvent) {
      case Change.CREATED:
      case Change.SCHEDULED:
      case Change.EDITED:
      case Status.CANCELLED:
      case Change.CANCELLED:
        receivers.push(UserType.RIDER);
        if (hasDriver) receivers.push(UserType.DRIVER);
        break;
      default:
        console.log('no notif', sender, notifEvent);
        break;
    }
  }
  return receivers;
};
