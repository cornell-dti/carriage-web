import { v4 as uuid } from 'uuid';
import { Ride, Status, SchedulingState, Type, Tag } from '../types';
import { RiderType } from '@carriage-web/shared/src/types/rider';
import { DriverType } from '@carriage-web/shared/src/types/driver';
import { LocationType } from '@carriage-web/shared/src/types/location';

// Type aliases for better readability
type RideType = Ride;

/**
 * Model Fixtures - Default object creators for all data models
 * Each function creates a properly structured default object with all required fields
 * Uses UUID generation pattern matching the backend
 */

/**
 * Creates a default Driver object with all required fields
 */
export function createDefaultDriver(): DriverType {
  return {
    id: uuid(),
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    photoLink: undefined,
    availability: [],
    active: true,
    joinDate: new Date().toISOString(),
  };
}

/**
 * Creates a default Rider object with all required fields
 */
export function createDefaultRider(): RiderType {
  return {
    id: uuid(),
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    accessibility: [],
    organization: undefined,
    description: '',
    joinDate: new Date().toISOString(),
    endDate: '',
    address: '',
    favoriteLocations: [],
    photoLink: undefined,
    active: true,
  };
}

/**
 * Creates a default Location object with all required fields
 */
export function createDefaultLocation(): LocationType {
  return {
    id: '',
    name: '',
    address: '',
    shortName: '',
    info: '',
    tag: Tag.CUSTOM,
    lat: 0,
    lng: 0,
    photoLink: undefined,
    images: [],
  };
}

/**
 * Creates a default Start Location centered on campus for better map UX
 */
export function createDefaultStartLocation(): LocationType {
  return {
    ...createDefaultLocation(),
    name: 'Select Pickup Location',
    shortName: 'Pickup',
    // Cornell area defaults to keep the map reasonable
    lat: 42.4534531,
    lng: -76.4760776,
  };
}

/**
 * Creates a default End Location centered on campus for better map UX
 */
export function createDefaultEndLocation(): LocationType {
  return {
    ...createDefaultLocation(),
    name: 'Select Dropoff Location',
    shortName: 'Dropoff',
    // Slight offset from the default start location so it's not identical
    lat: 42.4554531,
    lng: -76.4730776,
  };
}

/**
 * Creates a default Ride object with all required fields
 * Uses 'new' as ID for frontend detection of new rides
 */
export function createDefaultRide(): RideType {
  const now = new Date();
  const today = new Date(now);
  today.setDate(today.getDate());

  today.setHours(today.getHours(), today.getMinutes(), 0, 0);

  const endTime = new Date(today);
  endTime.setHours(today.getHours(), today.getMinutes() + 30, 0, 0);
  // Create empty location templates for pickup/dropoff
  const emptyPickupLocation = createDefaultStartLocation();

  const emptyDropoffLocation = createDefaultEndLocation();

  return {
    id: 'new', // Special ID for new rides - backend will assign UUID
    type: Type.UPCOMING,
    status: Status.NOT_STARTED,
    schedulingState: SchedulingState.UNSCHEDULED,
    startTime: today.toISOString(),
    endTime: endTime.toISOString(),
    startLocation: emptyPickupLocation,
    endLocation: emptyDropoffLocation,
    riders: [],
    driver: undefined,
    isRecurring: false,
    rrule: undefined,
    exdate: undefined,
    rdate: undefined,
    parentRideId: undefined,
    recurrenceId: undefined,
    timezone: 'America/New_York',
  };
}

/**
 * Utility functions for creating objects with custom overrides
 */
export function createDriverWithDefaults(
  overrides: Partial<DriverType> = {}
): DriverType {
  return {
    ...createDefaultDriver(),
    ...overrides,
  };
}

export function createRiderWithDefaults(
  overrides: Partial<RiderType> = {}
): RiderType {
  return {
    ...createDefaultRider(),
    ...overrides,
  };
}

export function createLocationWithDefaults(
  overrides: Partial<LocationType> = {}
): LocationType {
  return {
    ...createDefaultLocation(),
    ...overrides,
  };
}

export function createRideWithDefaults(
  overrides: Partial<RideType> = {}
): RideType {
  return {
    ...createDefaultRide(),
    ...overrides,
  };
}

/**
 * Legacy compatibility - alias for createDefaultRide
 */
export function createEmptyRide(): RideType {
  return createDefaultRide();
}

/**
 * Checks if a ride is a new ride (not yet persisted)
 */
export function isNewRide(ride: RideType): boolean {
  return ride.id === 'new';
}

/**
 * Model Comparison Utilities
 * Provides deep comparison functions for all model types
 */

/**
 * Deep comparison for any two objects
 */
export function deepCompare(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
    return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepCompare(obj1[key], obj2[key])) return false;
  }

  return true;
}

/**
 * Compare two date/time strings (handles precision differences)
 */
export function compareDateTime(date1: string, date2: string): boolean {
  if (date1 === date2) return true;
  if (!date1 || !date2) return false;

  const time1 = new Date(date1).getTime();
  const time2 = new Date(date2).getTime();

  return time1 === time2;
}

/**
 * Compare two Location objects
 */
export function compareLocation(
  loc1: LocationType,
  loc2: LocationType
): boolean {
  if (!loc1 || !loc2) return loc1 === loc2;

  return (
    loc1.id === loc2.id &&
    loc1.name === loc2.name &&
    loc1.address === loc2.address &&
    loc1.lat === loc2.lat &&
    loc1.lng === loc2.lng
  );
}

/**
 * Compare two Driver objects
 */
export function compareDriver(
  driver1: DriverType | null,
  driver2: DriverType | null
): boolean {
  if (driver1 === driver2) return true;
  if (!driver1 || !driver2) return false;

  return (
    driver1.id === driver2.id &&
    driver1.firstName === driver2.firstName &&
    driver1.lastName === driver2.lastName &&
    driver1.email === driver2.email &&
    driver1.phoneNumber === driver2.phoneNumber
  );
}

/**
 * Compare two Rider objects
 */
export function compareRider(rider1: RiderType, rider2: RiderType): boolean {
  return (
    rider1.id === rider2.id &&
    rider1.firstName === rider2.firstName &&
    rider1.lastName === rider2.lastName &&
    rider1.email === rider2.email &&
    rider1.phoneNumber === rider2.phoneNumber
  );
}

/**
 * Compare two arrays of riders
 */
export function compareRiders(
  riders1: RiderType[],
  riders2: RiderType[]
): boolean {
  if (riders1.length !== riders2.length) return false;

  // Sort by ID to ensure consistent comparison
  const sorted1 = [...riders1].sort((a, b) => a.id.localeCompare(b.id));
  const sorted2 = [...riders2].sort((a, b) => a.id.localeCompare(b.id));

  for (let i = 0; i < sorted1.length; i++) {
    if (!compareRider(sorted1[i], sorted2[i])) return false;
  }

  return true;
}

/**
 * Compare two Ride objects for changes
 */
export function compareRide(ride1: RideType, ride2: RideType): boolean {
  return (
    compareDateTime(ride1.startTime, ride2.startTime) &&
    compareDateTime(ride1.endTime, ride2.endTime) &&
    compareLocation(ride1.startLocation, ride2.startLocation) &&
    compareLocation(ride1.endLocation, ride2.endLocation) &&
    compareDriver(ride1.driver || null, ride2.driver || null) &&
    compareRiders(ride1.riders || [], ride2.riders || []) &&
    ride1.status === ride2.status &&
    ride1.schedulingState === ride2.schedulingState &&
    ride1.type === ride2.type
  );
}

/**
 * Get changed fields between two rides
 */
export function getRideChanges(
  originalRide: RideType,
  editedRide: RideType
): Partial<RideType> {
  const changes: Partial<RideType> = {};

  if (!compareDateTime(originalRide.startTime, editedRide.startTime)) {
    changes.startTime = editedRide.startTime;
  }

  if (!compareDateTime(originalRide.endTime, editedRide.endTime)) {
    changes.endTime = editedRide.endTime;
  }

  if (!compareLocation(originalRide.startLocation, editedRide.startLocation)) {
    changes.startLocation = editedRide.startLocation;
  }

  if (!compareLocation(originalRide.endLocation, editedRide.endLocation)) {
    changes.endLocation = editedRide.endLocation;
  }

  if (!compareDriver(originalRide.driver || null, editedRide.driver || null)) {
    changes.driver = editedRide.driver;
  }

  if (!compareRiders(originalRide.riders || [], editedRide.riders || [])) {
    changes.riders = editedRide.riders;
  }

  if (originalRide.status !== editedRide.status) {
    changes.status = editedRide.status;
  }

  if (originalRide.schedulingState !== editedRide.schedulingState) {
    changes.schedulingState = editedRide.schedulingState;
  }

  if (originalRide.type !== editedRide.type) {
    changes.type = editedRide.type;
  }

  return changes;
}

/**
 * Check if a ride has any changes
 */
export function hasRideChanges(
  originalRide: RideType,
  editedRide: RideType
): boolean {
  return !compareRide(originalRide, editedRide);
}
