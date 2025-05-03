import { Ride, Type, Status, Tag, Accessibility } from '../../types';
import { DayOfWeek } from '../../types/index';

// Dummy driver data with availability
const driverData = {
  id: 'driver_1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'johndoe@example.com',
  phoneNumber: '555-123-4567',
  active: true,
  availability: [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ],
  joinDate: '2024-01-15',
};

// Driver 2 with different availability
const driver2Data = {
  id: 'driver_2',
  firstName: 'Michael',
  lastName: 'Smith',
  email: 'msmith@example.com',
  phoneNumber: '555-765-4321',
  active: true,
  availability: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
  joinDate: '2024-02-20',
};

// Driver 3 with weekend availability
const driver3Data = {
  id: 'driver_3',
  firstName: 'David',
  lastName: 'Brown',
  email: 'dbrown@example.com',
  phoneNumber: '555-987-6543',
  active: true,
  availability: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
  joinDate: '2024-03-10',
};

// Dummy rider data
const riderData = {
  phoneNumber: '518-818-8059',
  active: true,
  accessibility: [
    Accessibility.ASSISTANT,
    Accessibility.CRUTCHES,
    Accessibility.WHEELCHAIR,
  ],
  endDate: '2024-10-31',
  lastName: 'Atikpui',
  favoriteLocations: [],
  joinDate: '2024-10-17',
  address: '817 N Aurora St, Ithaca, NY 14850',
  email: 'dka34@cornell.edu',
  id: '34a57961-1af4-4fee-82b2-0d85b8485e86',
  firstName: 'Desmond',
};

// Create a date for today with specific times
const today = new Date();
const createTimeToday = (hours: number, minutes: number) => {
  const date = new Date(today);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Sample today's rides
export const todaysRides: Ride[] = [
  {
    id: 'ride_1',
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: {
      name: 'Bailey Hall',
      address: '123 College Ave',
      tag: Tag.CENTRAL,
    },
    endLocation: {
      name: 'Uris Library',
      address: '456 University St',
      tag: Tag.WEST,
    },
    startTime: createTimeToday(9, 0), // 9:00 AM
    endTime: createTimeToday(9, 30), // 9:30 AM
    rider: riderData,
    driver: driverData,
    recurring: false,
  },
  {
    id: 'ride_2',
    type: Type.ACTIVE,
    status: Status.ON_THE_WAY,
    late: false,
    startLocation: {
      name: 'Statler Hall',
      address: '7 East Ave',
      tag: Tag.CENTRAL,
    },
    endLocation: {
      name: 'Upson Hall',
      address: '124 Hoy Rd',
      tag: Tag.NORTH,
    },
    startTime: createTimeToday(10, 15), // 10:15 AM
    endTime: createTimeToday(10, 45), // 10:45 AM
    rider: {
      ...riderData,
      firstName: 'Emma',
      lastName: 'Johnson',
      id: 'rider_2',
    },
    driver: driver2Data,
    recurring: true,
  },
  {
    id: 'ride_3',
    type: Type.ACTIVE,
    status: Status.COMPLETED,
    late: true,
    startLocation: {
      name: 'Collegetown',
      address: '111 Dryden Rd',
      tag: Tag.EAST,
    },
    endLocation: {
      name: 'North Campus',
      address: '230 Triphammer Rd',
      tag: Tag.NORTH,
    },
    startTime: createTimeToday(8, 0), // 8:00 AM
    endTime: createTimeToday(8, 30), // 8:30 AM
    rider: {
      ...riderData,
      firstName: 'Sarah',
      lastName: 'Williams',
      id: 'rider_3',
    },
    driver: driverData, // Same driver as ride_1
    recurring: false,
  },
  {
    id: 'ride_4',
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: {
      name: 'Downtown Hub',
      address: '123 State Street',
      tag: Tag.CUSTOM,
    },
    endLocation: {
      name: 'Philips Hall',
      address: '456 Campus Road',
      tag: Tag.CENTRAL,
    },
    startTime: createTimeToday(14, 0), // 2:00 PM
    endTime: createTimeToday(14, 30), // 2:30 PM
    rider: {
      ...riderData,
      firstName: 'Alex',
      lastName: 'Chen',
      id: 'rider_4',
    },
    driver: driverData, // Same driver as ride_1 and ride_3
    recurring: true,
  },
  {
    id: 'ride_5',
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: {
      name: 'Mann Library',
      address: '237 Mann Drive',
      tag: Tag.CENTRAL,
    },
    endLocation: {
      name: 'Noyes Fitness Center',
      address: '306 West Ave',
      tag: Tag.WEST,
    },
    startTime: createTimeToday(16, 30), // 4:30 PM
    endTime: createTimeToday(17, 0), // 5:00 PM
    rider: {
      ...riderData,
      firstName: 'Jessica',
      lastName: 'Lee',
      id: 'rider_5',
    },
    driver: driver3Data,
    recurring: false,
  },
];
