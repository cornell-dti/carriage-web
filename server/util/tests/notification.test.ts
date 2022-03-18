import { RideType, Status, Type } from '../../models/ride';
import { Change } from '../types';
import { UserType } from '../../models/subscription';
import { Tag } from '../../models/location';
import { DriverType } from '../../models/driver';
import { RiderType } from '../../models/rider';
import initDynamoose from '../dynamoose';
import { notify } from '../notification';

initDynamoose();

const rider: RiderType = {
  id: '13a93174-fd7c-4168-af52-f9905bb8993f',
  firstName: 'Rider',
  lastName: 'Rider',
  phoneNumber: '',
  email: '',
  accessibility: [],
  joinDate: '',
  endDate: '',
  address: '',
  favoriteLocations: [],
  active: true,
};

const unscheduledRide: RideType = {
  id: 'ride',
  type: Type.UNSCHEDULED,
  startLocation: {
    id: 'loc1',
    name: 'Location 1',
    address: '',
    tag: Tag.CENTRAL,
  },
  endLocation: {
    id: 'loc2',
    name: 'Location 2',
    address: '',
    tag: Tag.CENTRAL,
  },
  startTime: '2022-09-28T15:00:00.000Z',
  endTime: '2022-09-28T15:00:00.000Z',
  status: Status.NOT_STARTED,
  late: false,
  rider,
  recurring: false,
};

const driver1: DriverType = {
  id: 'driver1',
  firstName: 'First',
  lastName: 'Driver',
  availability: {},
  vehicle: {
    id: '',
    name: '',
    capacity: 0,
  },
  phoneNumber: '',
  startDate: '',
  email: '',
  admin: false,
};

const driver2: DriverType = {
  ...driver1,
  id: 'driver2',
  firstName: 'Second',
  lastName: 'Driver',
};

const scheduledRide: RideType = {
  ...unscheduledRide,
  type: Type.ACTIVE,
  driver: driver1,
};

// Surpress warnings
// process.on('unhandledRejection', () => {});

// Test what notifications are sent
notify(
  unscheduledRide,
  { endTime: '2022-09-28T15:00:00.000Z' },
  UserType.ADMIN
);
