import {
  AvailabilityType,
  Ride,
  Type,
  Status,
  Tag,
  Driver,
  Rider,
} from '../../types';
import {
  MOCK_RIDERS,
  MOCK_RIDES,
  randomDriver,
  randomRide,
  randomRider,
} from '../../util/mocking';

const TODAY = new Date().toISOString().split('T')[0];

export const LOGGED_IN_DRIVER_ID = '317c73c1-0eeb-4dac-9896-2f30db9505ec';
// export const LOGGED_IN_DRIVER_ID = "123"

// Sample driver availability to test todays Rides table
const defaultAvailability: AvailabilityType = {
  Mon: { startTime: '09:00', endTime: '17:00' },
  Tue: { startTime: '09:00', endTime: '17:00' },
  Wed: { startTime: '09:00', endTime: '17:00' },
  Thu: { startTime: '09:00', endTime: '17:00' },
  Fri: { startTime: '09:00', endTime: '17:00' },
};

export const todaysRides: Ride[] = MOCK_RIDES;
