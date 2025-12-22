import { RideType, Status, SchedulingState } from '../types';

export type UserRole = 'admin' | 'driver' | 'rider';

/**
 * Determines if a ride is in the past based on its end time
 * @param ride The ride to check
 * @returns True if the ride is in the past
 */
export function isRidePast(ride: RideType): boolean {
  const now = new Date();
  const rideEndTime = new Date(ride.endTime);

  // Consider invalid dates as not past to be safe
  if (isNaN(rideEndTime.getTime())) {
    return false;
  }

  return rideEndTime < now;
}

/**
 * Determines if a ride is currently active (started but not completed)
 * @param ride The ride to check
 * @returns True if the ride is currently active
 */
export function isRideActive(ride: RideType): boolean {
  const activeStatuses = [Status.ON_THE_WAY, Status.ARRIVED, Status.PICKED_UP];

  return activeStatuses.includes(ride.status);
}

/**
 * Determines if a ride is completed (finished successfully or unsuccessfully)
 * @param ride The ride to check
 * @returns True if the ride is completed
 */
export function isRideCompleted(ride: RideType): boolean {
  const completedStatuses = [
    Status.COMPLETED,
    Status.NO_SHOW,
    Status.CANCELLED,
  ];

  return completedStatuses.includes(ride.status);
}

/**
 * Determines if a user can edit a ride based on their role and ride state
 * @param ride The ride to check
 * @param userRole The role of the user
 * @returns True if the user can edit the ride
 */
export function canEditRide(ride: RideType, userRole: UserRole): boolean {
  // Past or completed rides cannot be edited
  if (isRidePast(ride) || isRideCompleted(ride) || isRideActive(ride)) {
    return false;
  }

  // Time-based check for past/active ride
  const now = new Date();
  const rideStartTime = new Date(ride.startTime);

  if (now > rideStartTime) {
    return false;
  }

  // Drivers cannot edit rides
  if (userRole === 'driver') {
    return false;
  }

  // Riders can only edit unscheduled rides
  if (userRole === 'rider') {
    return ride.schedulingState === SchedulingState.UNSCHEDULED;
  }

  // Admins can edit any ride
  if (userRole === 'admin') {
    return true;
  }

  return false;
}

/**
 * Determines if a user can update the status of a ride
 * @param ride The ride to check
 * @param userRole The role of the user
 * @returns True if the user can update the status
 */
export function canUpdateStatus(ride: RideType, userRole: UserRole): boolean {
  // Past rides cannot have status updates
  if (isRidePast(ride)) {
    return false;
  }

  // Completed rides cannot have status updates
  if (isRideCompleted(ride)) {
    return false;
  }

  // Only drivers and admins can update status
  if (userRole === 'rider') {
    return false;
  }

  // Drivers can only update status if they are assigned to the ride
  if (userRole === 'driver') {
    return ride.driver !== undefined;
  }

  // Admins can always update status for non-past, non-completed rides
  if (userRole === 'admin') {
    return true;
  }

  return false;
}

/**
 * Determines if a user can assign or change the driver for a ride
 * @param ride The ride to check
 * @param userRole The role of the user
 * @returns True if the user can assign/change the driver
 */
export function canAssignDriver(ride: RideType, userRole: UserRole): boolean {
  // Only admins can assign drivers
  if (userRole !== 'admin') {
    return false;
  }

  // Admins can assign drivers to any ride regardless of timing or status
  return true;
}

/**
 * Determines if a user can change the rider for a ride
 * @param ride The ride to check
 * @param userRole The role of the user
 * @returns True if the user can change the rider
 */
export function canChangeRider(ride: RideType, userRole: UserRole): boolean {
  // Only admins can change riders
  if (userRole !== 'admin') {
    return false;
  }

  // Admins can change riders for any ride regardless of timing or status
  return true;
}

/**
 * Gets a user-friendly message explaining why an action cannot be performed
 * @param ride The ride
 * @param action The action being attempted
 * @param userRole The user's role
 * @returns A message explaining why the action is restricted
 */
export function getRestrictionMessage(
  ride: RideType,
  action: 'edit' | 'updateStatus' | 'assignDriver' | 'changeRider' | 'cancel',
  userRole: UserRole
): string {
  if (isRidePast(ride)) {
    return 'This action cannot be performed on past rides.';
  }

  if (isRideCompleted(ride)) {
    return 'This action cannot be performed on completed rides.';
  }

  switch (action) {
    case 'edit':
      if (userRole === 'driver') {
        return 'Drivers cannot edit ride details.';
      }
      if (
        userRole === 'rider' &&
        ride.schedulingState === SchedulingState.SCHEDULED
      ) {
        return 'Riders cannot edit scheduled rides.';
      }
      break;

    case 'updateStatus':
      if (userRole === 'rider') {
        return 'Riders cannot update ride status.';
      }
      if (userRole === 'driver' && !ride.driver) {
        return 'You must be assigned to this ride to update its status.';
      }
      break;

    case 'assignDriver':
      if (userRole !== 'admin') {
        return 'Only administrators can assign drivers.';
      }
      if (isRideActive(ride)) {
        return 'Cannot change driver assignment for active rides.';
      }
      break;

    case 'changeRider':
      if (userRole !== 'admin') {
        return 'Only administrators can change riders.';
      }
      if (isRideActive(ride)) {
        return 'Cannot change rider for active rides.';
      }
      break;

    case 'cancel':
      if (userRole === 'driver') {
        return 'Drivers cannot cancel rides.';
      }
      if (userRole === 'rider' && ride.status !== Status.NOT_STARTED) {
        return 'Rides can only be cancelled before they start.';
      }
      if (isRideActive(ride)) {
        return 'Cannot cancel rides that are already in progress.';
      }
      break;
  }

  return 'This action is not permitted.';
}

/**
 * Determines if a ride can be cancelled by the user
 * @param ride The ride to check
 * @param userRole The role of the user
 * @returns True if the user can cancel the ride
 */
export function canCancelRide(ride: RideType, userRole: UserRole): boolean {
  // Cannot cancel past or already completed rides
  if (isRidePast(ride) || isRideCompleted(ride)) {
    return false;
  }

  // Riders can cancel their own rides if they haven't started yet
  if (userRole === 'rider') {
    // Allow cancellation if ride hasn't started (not active) and not already completed
    return ride.status === Status.NOT_STARTED;
  }

  // Drivers cannot cancel rides
  if (userRole === 'driver') {
    return false;
  }

  // Admins can cancel any non-past, non-completed ride
  if (userRole === 'admin') {
    return true;
  }

  return false;
}

/**
 * Determines if a ride requires immediate attention based on its status and timing
 * @param ride The ride to check
 * @returns True if the ride needs attention
 */
export function rideRequiresAttention(ride: RideType): boolean {
  const now = new Date();
  const rideStartTime = new Date(ride.startTime);
  const rideEndTime = new Date(ride.endTime);

  // Invalid dates don't require attention
  if (isNaN(rideStartTime.getTime()) || isNaN(rideEndTime.getTime())) {
    return false;
  }

  // Unscheduled rides that are supposed to start within 24 hours
  if (ride.schedulingState === SchedulingState.UNSCHEDULED) {
    const timeDiff = rideStartTime.getTime() - now.getTime();
    const hoursUntilStart = timeDiff / (1000 * 60 * 60);
    return hoursUntilStart <= 24 && hoursUntilStart > 0;
  }

  // Scheduled rides without a driver that start within 2 hours
  if (!ride.driver) {
    const timeDiff = rideStartTime.getTime() - now.getTime();
    const hoursUntilStart = timeDiff / (1000 * 60 * 60);
    return hoursUntilStart <= 2 && hoursUntilStart > 0;
  }

  // Active rides that are running late
  if (isRideActive(ride)) {
    return now > rideEndTime;
  }

  return false;
}
