import { RideType, Status, Type } from '../../models/ride';
import { UserType } from '../../models/subscription';
import { Tag } from '../../models/location';
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
  accessibility: '',
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


// Surpress warnings
// process.on('unhandledRejection', () => {});

// Test what notifications are sent
notify(
  unscheduledRide,
  { endTime: '2022-09-28T15:00:00.000Z' },
  UserType.ADMIN
);
