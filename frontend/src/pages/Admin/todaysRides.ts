import {
  AvailabilityType,
  Ride,
  Type,
  Status,
  Tag,
  Driver,
  Rider,
} from 'types';
import { randomDriver, randomRide, randomRider } from 'util/mocking';

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

//creating 6 drivers
const randomDrivers: Driver[] = Array.from({ length: 6 }, (_, idx) =>
  randomDriver()
);

const randomRiders: Rider[] = Array.from({ length: 70 }, (_, idx) =>
  randomRider()
);

export const todaysRides: Ride[] = Array.from({ length: 30 }, (_, idx) =>
  randomRide(randomDrivers, randomRiders)
);
