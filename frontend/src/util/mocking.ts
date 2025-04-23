import {
  Tag,
  Location,
  Accessibility,
  Organization,
  Availability,
  AvailabilityType,
  Vehicle,
  Driver,
  Rider,
  Ride,
  Type,
  Status,
} from '../types';
import { faker } from '@faker-js/faker';

const DateToDateString = (date: Date) => date.toISOString().split('T')[0];
const DateToTimeString = (date: Date) => date.toISOString().split('T')[1];
export const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Bailey Hall - Left',
    shortName: 'Bailey Hall - Left',
    lat: 42.449028,
    lng: -76.480139,
    address: '230 Garden Ave, Ithaca, NY 14853',
    tag: Tag.EAST,
    info: 'Near the river',
  },
  {
    id: '2',
    name: 'Bailey Hall - Right',
    shortName: 'Bailey Hall - Right',
    lat: 42.449028,
    lng: -76.480139,
    address: '230 Garden Ave, Ithaca, NY 14853',
    tag: Tag.WEST,
  },
  {
    id: '3',
    name: 'Malott Hall Parking',
    shortName: 'Malott Short Name',
    lat: 42.4495,
    lng: -76.4815,
    address: '212 Garden Ave, Ithaca, NY 14853',
    tag: Tag.CENTRAL,
    info: 'Open 9am-9pm',
  },
  {
    id: '4',
    name: 'Baker Hall Parking',
    shortName: 'Baker Parking',
    lat: 42.4485,
    lng: -76.4825,
    address: 'Baker Hall, Ithaca, NY 14853',
    tag: Tag.NORTH,
  },
  {
    id: '5',
    name: 'Rhodes Hall Back',
    shortName: 'Rhodes Back',
    lat: 42.4445,
    lng: -76.482,
    address: '136 Hoy Road, Ithaca, NY 14853',
    tag: Tag.CTOWN,
    info: 'Near university',
  },
  {
    id: '6',
    name: 'Prog. House Dr',
    shortName: 'Prog Dr',
    lat: 42.453,
    lng: -76.4819,
    address: 'Program House Drive, Cornell University, Ithaca, NY',
    tag: Tag.DTOWN,
  },
  {
    id: '7',
    name: 'McClintock Back',
    shortName: 'McClint Back',
    lat: 42.4538,
    lng: -76.4758,
    address: 'Barbara McClintock Hall, 224 Cradit Farm Dr, Ithaca, NY 14850',
    tag: Tag.INACTIVE,
    info: 'Closed for renovation',
  },
  {
    id: '8',
    name: 'Ganedago Back',
    shortName: 'Ganedago b',
    lat: 42.509,
    lng: -76.484,
    address: '110 Ho Plaza, Cornell University, Ithaca, NY 14853',
    tag: Tag.CUSTOM,
  },
  {
    id: '9',
    name: 'Noyes Parking',
    shortName: 'Noyes Pk',
    lat: 42.448,
    lng: -76.484,
    address:
      'Noyes Community Recreation Center, West Campus, Cornell University, Ithaca, NY 14853',
    tag: Tag.EAST,
  },
  {
    id: '10',
    name: 'Casc. Hall',
    shortName: 'Casc. Hall',
    lat: 42.444,
    lng: -76.482,
    address: 'Cascadilla Hall, Cornell University, Ithaca, NY 14853',
    tag: Tag.WEST,
  },
];

/**
 * @returns a randomly selected location from a predefined set of fake locations
 */
export const randomLocation = () => faker.helpers.arrayElement(MOCK_LOCATIONS);

/**
 * @returns {Rider} a rider with randomized characteristics like name, phone, email, etc.
 */
export const randomRider = (): Rider => {
  const accessibilityValues = Object.values(Accessibility);
  const organizationValues = Object.values(Organization);

  // picking random number of (unique) accessibility values
  const accessibilityCount =
    Math.random() > 0.5
      ? Math.floor((Math.random() * accessibilityValues.length) / 2)
      : 0;
  const accessibility = faker.helpers.arrayElements(
    accessibilityValues,
    accessibilityCount
  );

  const organization =
    Math.random() < 0.5
      ? faker.helpers.arrayElement(organizationValues)
      : undefined;

  const joinDateObj = faker.date.past({ years: 3 });
  const joinDate = DateToDateString(joinDateObj);

  const endDateObj = new Date(joinDateObj);
  endDateObj.setFullYear(endDateObj.getFullYear() + 4);
  const endDate = DateToDateString(endDateObj);

  const active = true;

  const favoriteLocationsCount = Math.floor(Math.random() * 5);
  const favoriteLocations = Array.from({ length: favoriteLocationsCount }, () =>
    faker.helpers.arrayElement(
      MOCK_LOCATIONS.map((location) => {
        return location.name;
      })
    )
  );

  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: Math.random() < 0.5 ? faker.phone.number() : undefined,
    email: faker.internet.email(),
    accessibility,
    organization,
    description: Math.random() < 0.5 ? faker.lorem.sentence() : undefined,
    joinDate,
    endDate,
    pronouns:
      Math.random() < 0.75
        ? faker.helpers.arrayElement(['he/him', 'she/her', 'they/them'])
        : undefined,
    address: faker.location.streetAddress({ useFullAddress: true }),
    favoriteLocations,
    photoLink: Math.random() < 0.5 ? faker.image.avatar() : undefined,
    active,
  };
};

const mockVehicleTypes: Vehicle[] = [
  {
    id: faker.string.uuid(),
    name: 'minivan',
    capacity: 6,
  },
  {
    id: faker.string.uuid(),
    name: 'Sedan',
    capacity: 4,
  },
];

/**
 * @returns {Driver} a driver with randomized characteristics like name, phone, etc.
 */
export const randomDriver = (): Driver => {
  const allAvailability: Availability = {
    startTime: DateToTimeString(new Date()),
    endTime: DateToTimeString(new Date()),
  };

  const availability: AvailabilityType = {
    Mon: allAvailability,
    Tue: allAvailability,
    Wed: allAvailability,
    Thu: allAvailability,
    Fri: allAvailability,
  };

  const vehicle = faker.helpers.arrayElement(mockVehicleTypes);

  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    availability,
    vehicle,
    phoneNumber: faker.phone.number(),
    startDate: DateToDateString(faker.date.past({ years: 10 })),
    email: faker.internet.email(),
  };
};

/**
 * @param {Driver} drivers a list of possible drivers that this ride can take
 * @param {Rider} riders a list of possible riders that can this ride can belong to
 */
export const randomRide = (drivers: Driver[], riders: Rider[]): Ride => {
  const dayStart = new Date();
  dayStart.setHours(7, 0, 0, 0);

  const dayLastRides = new Date();
  dayLastRides.setHours(15, 30, 0, 0);

  const dayEnd = new Date();
  dayEnd.setHours(16, 0, 0, 0);

  const rideStart = faker.date.between({ from: dayStart, to: dayLastRides });

  const minEndTime = new Date(rideStart.getTime() + 5 * 60 * 1000); // 5 minutes after start
  const maxEndTime = new Date(rideStart.getTime() + 30 * 60 * 1000); // 30 minutes after start

  const adjustedMaxEndTime = maxEndTime > dayEnd ? dayEnd : maxEndTime;

  const rideEnd = faker.date.between({
    from: minEndTime,
    to: adjustedMaxEndTime,
  });
  return {
    id: faker.string.uuid(),
    type: faker.helpers.enumValue(Type),
    status: faker.helpers.enumValue(Status),
    late: Math.random() > 0.5,
    startLocation: randomLocation(),
    endLocation: randomLocation(),
    startTime: rideStart,
    endTime: rideEnd,
    noShow: Math.random() > 0.9,
    rider: faker.helpers.arrayElement(riders),
    driver: faker.helpers.arrayElement(drivers),
    recurring: false,
  };
};

export const MOCK_DRIVERS: Driver[] = Array.from({ length: 6 }, (_, idx) =>
  randomDriver()
);

export const MOCK_RIDERS: Rider[] = Array.from({ length: 70 }, (_, idx) =>
  randomRider()
);

export const MOCK_RIDES: Ride[] = Array.from({ length: 100 }, (_, idx) =>
  randomRide(MOCK_DRIVERS, MOCK_RIDERS)
);
