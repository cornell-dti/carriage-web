import { UserType } from '../models/subscription';
import { Change, NotificationEvent } from '@carriage-web/shared/types';
import { RideType, Status } from '@carriage-web/shared/types/ride';
import { timeTo12Hr, timeToMDY } from './index';

const getCancelledMessage = (receiver: UserType, ride: RideType) => {
  // Use primary rider (first in array) for message templates
  const primaryRider =
    ride.riders && ride.riders.length > 0 ? ride.riders[0] : null;
  const { startTime, startLocation, endLocation } = ride;
  if (receiver === UserType.DRIVER) {
    return `Rides have been removed from your schedule for ${timeToMDY(
      startTime
    )}.`;
  }
  if (receiver === UserType.RIDER) {
    return `Your ride on ${timeToMDY(startTime)} from ${
      startLocation.name
    } to ${endLocation.name} at ${timeTo12Hr(startTime)} has been cancelled.`;
  }
  return `${primaryRider?.firstName || 'A rider'} ${
    primaryRider?.lastName || ''
  } cancelled their ride on ${timeToMDY(startTime)} from ${
    startLocation.name
  } to ${endLocation.name} at ${timeTo12Hr(startTime)}.`;
};

const getCreatedMessage = (receiver: UserType, ride: RideType) => {
  const { startTime, startLocation, endLocation } = ride;
  if (receiver === UserType.RIDER) {
    return `A ride on ${timeToMDY(startTime)} from ${startLocation.name} to ${
      endLocation.name
    } at ${timeTo12Hr(startTime)} has been created.`;
  } else {
    return `Rides have been added to your schedule for ${timeToMDY(
      startTime
    )}.`;
  }
};

// Temporary message, should be updated to actually say what edits are made.
const getEditedMessage = (
  sender: UserType,
  receiver: UserType,
  ride: RideType
) => {
  const primaryRider =
    ride.riders && ride.riders.length > 0 ? ride.riders[0] : null;
  const { startTime } = ride;
  if (sender === UserType.RIDER) {
    return `${primaryRider?.firstName || 'A rider'} ${
      primaryRider?.lastName || ''
    } made changes to their ride on ${timeToMDY(startTime)} at ${timeTo12Hr(
      startTime
    )}`;
  }
  if (receiver === UserType.RIDER) {
    return 'Your ride information has been edited. Please review your ride info.';
  }
  return `Ride information has been edited in your schedule for ${timeToMDY(
    startTime
  )}.`;
};

const getLateMessage = (receiver: UserType, ride: RideType) => {
  const { driver, startLocation } = ride;
  if (receiver === UserType.RIDER) {
    return 'Your driver is running late! Please wait indoors.';
  } else {
    return `${driver?.firstName} ${driver?.lastName} is running late to ${startLocation.name}.`;
  }
};

const getNoShowMessage = (receiver: UserType, ride: RideType) => {
  const primaryRider =
    ride.riders && ride.riders.length > 0 ? ride.riders[0] : null;
  if (receiver === UserType.RIDER) {
    return 'Your driver cancelled the ride because the driver was unable to find you.';
  } else {
    return `${primaryRider?.firstName || 'A rider'} ${
      primaryRider?.lastName || ''
    } missed a ride.`;
  }
};

const getScheduledMessage = (receiver: UserType, ride: RideType) => {
  const { startTime, startLocation, endLocation } = ride;
  if (receiver === UserType.RIDER) {
    return `Your ride on ${timeToMDY(startTime)} from ${
      startLocation.name
    } to ${endLocation.name} at ${timeTo12Hr(startTime)} has been confirmed.`;
  } else {
    return `Rides have been added to your schedule for ${timeToMDY(
      startTime
    )}.`;
  }
};

export const getMessage = (
  sender: UserType,
  receiver: UserType,
  notifEvent: NotificationEvent,
  ride: RideType
) => {
  switch (notifEvent) {
    case Status.ARRIVED:
      return 'Your driver is here! Meet your driver at the pickup point.';
    case Status.CANCELLED:
    case Change.CANCELLED:
      return getCancelledMessage(receiver, ride);
    case Change.CREATED:
      return getCreatedMessage(receiver, ride);
    case Change.EDITED:
      return getEditedMessage(sender, receiver, ride);
    case Change.LATE:
      return getLateMessage(receiver, ride);
    case Status.NO_SHOW:
      return getNoShowMessage(receiver, ride);
    case Status.ON_THE_WAY:
      return 'Your driver is on the way! Wait outside to meet your driver.';
    case Change.SCHEDULED:
      return getScheduledMessage(receiver, ride);
    default:
      return '';
  }
};
