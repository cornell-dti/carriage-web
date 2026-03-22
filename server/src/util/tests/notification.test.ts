import {
  RideType,
  Status,
  Type,
  SchedulingState,
} from '@carriage-web/shared/types/ride';
import { UserType } from '../../models/subscription';
import { Tag } from '@carriage-web/shared/types/location';
import { RiderType } from '@carriage-web/shared/types/rider';
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
  type: Type.UPCOMING,
  status: Status.NOT_STARTED,
  schedulingState: SchedulingState.UNSCHEDULED,
  startLocation: {
    id: 'loc1',
    name: 'Location 1',
    address: '',
    shortName: 'Loc1',
    tag: Tag.CENTRAL,
    lat: 42.444,
    lng: -76.5019,
  },
  endLocation: {
    id: 'loc2',
    name: 'Location 2',
    address: '',
    shortName: 'Loc2',
    tag: Tag.CENTRAL,
    lat: 42.444,
    lng: -76.5019,
  },
  startTime: '2022-09-28T15:00:00.000Z',
  endTime: '2022-09-28T15:00:00.000Z',
  riders: [rider],
  isRecurring: false,
  timezone: 'America/New_York',
};

// Surpress warnings
// process.on('unhandledRejection', () => {});

// Test what notifications are sent
notify(
  unscheduledRide,
  { endTime: '2022-09-28T15:00:00.000Z' },
  UserType.ADMIN
);
