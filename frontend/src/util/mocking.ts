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
} from 'types';
import { faker } from '@faker-js/faker';

const DateToDateString = (date: Date) => date.toISOString().split('T')[0];
const DateToTimeString = (date: Date) => date.toISOString().split('T')[1];

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Bailey Hall - Left',
    address: '123 East St',
    tag: Tag.EAST,
    info: 'Near the river',
  },
  {
    id: '2',
    name: 'Bailey Hall - Right',
    address: '456 West Ave',
    tag: Tag.WEST,
  },
  {
    id: '3',
    name: 'Malott Hall Parking',
    address: '789 Central Blvd',
    tag: Tag.CENTRAL,
    info: 'Open 9am-9pm',
  },
  {
    id: '4',
    name: 'Baker Hall Parking',
    address: '101 North Rd',
    tag: Tag.NORTH,
  },
  {
    id: '5',
    name: 'Rhodes Hall Back',
    address: '202 College St',
    tag: Tag.CTOWN,
    info: 'Near university',
  },
  {
    id: '6',
    name: 'Prog. House Dr',
    address: '303 Downtown Ave',
    tag: Tag.DTOWN,
  },
  {
    id: '7',
    name: 'McClintock Back',
    address: '404 Old Mill Rd',
    tag: Tag.INACTIVE,
    info: 'Closed for renovation',
  },
  {
    id: '8',
    name: 'Ganedago Back',
    address: '505 Custom Ln',
    tag: Tag.CUSTOM,
  },
  {
    id: '9',
    name: 'Noyes Parking',
    address: '606 East Market St',
    tag: Tag.EAST,
  },
  {
    id: '10',
    name: 'Casc. Hall',
    address: '707 Westside Dr',
    tag: Tag.WEST,
    info: 'Botanical garden',
  },
];

/**
 * @returns a randomly selected location from a predefined set of fake locations
 */
export const randomLocation = () => faker.helpers.arrayElement(mockLocations);

/**
 * @returns {Rider} a rider with randomized characteristics like name, phone, email, etc.
 */
export const randomRider = () => {
  const accessibilityValues = Object.values(Accessibility);
  const organizationValues = Object.values(Organization);

  // picking random number of (unique) accessibility values
  const accessibilityCount = Math.floor(
    Math.random() * accessibilityValues.length
  );
  const accessibility = faker.helpers.arrayElements(
    accessibilityValues,
    accessibilityCount
  );

  const organization =
    Math.random() < 0.5
      ? faker.helpers.arrayElement(organizationValues)
      : undefined;

  const joinDateObj = faker.date.past({ years: 4 });
  const joinDate = DateToDateString(joinDateObj);

  const endDate =
    Math.random() < 0.5
      ? DateToDateString(
          faker.date.between({
            from: joinDateObj,
            to: new Date(),
          })
        )
      : undefined;
  const active = endDate ? true : false;

  const favoriteLocationsCount = Math.floor(Math.random() * 5);
  const favoriteLocations = Array.from({ length: favoriteLocationsCount }, () =>
    faker.helpers.arrayElement(
      mockLocations.map((location) => {
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
    rider: faker.helpers.arrayElement(riders),
    driver: faker.helpers.arrayElement(drivers),
    recurring: false,
  };
};
