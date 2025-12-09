import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Driver } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { Vehicle, VehicleType } from '../src/models/vehicle';
import { AdminType } from '@carriage-web/shared/src/types/admin';
import {
  Accessibility,
  Organization,
  Rider,
  RiderType,
} from '../src/models/rider';
import { Ride, Status, Type } from '../src/models/ride';
import { Location } from '../src/models/location';
import { LocationType, Tag } from '@carriage-web/shared/src/types/location';
import moment from 'moment';

const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
  type: ['sds-admin'],
  isDriver: false,
};

const testRider: Omit<RiderType, 'id'> = {
  email: 'testrider-email@test.com',
  phoneNumber: '1234567890',
  firstName: 'TestRider',
  lastName: 'Testing',
  accessibility: [Accessibility.CRUTCHES, Accessibility.ASSISTANT],
  description: '',
  joinDate: '2023-03-09',
  endDate: '2024-03-09',
  address: '36 Colonial Ln, Ithaca, NY 14850',
  favoriteLocations: ['Test-Location 1'],
  organization: Organization.REDRUNNER,
  photoLink: '',
  active: true,
};

const testStatRider: RiderType = {
  id: 'abc-10',
  email: 'test-email@test.com',
  phoneNumber: '1234567890',
  firstName: 'Test',
  lastName: 'Testing',
  accessibility: [Accessibility.ASSISTANT],
  description: '',
  joinDate: '2023-03-09',
  endDate: '2024-03-09',
  address: '36 Colonial Ln, Ithaca, NY 14850',
  favoriteLocations: ['1'],
  organization: Organization.REDRUNNER,
  photoLink: '',
  active: true,
};

const testVehicles: VehicleType[] = [
  {
    id: 'vehicle1',
    name: 'Toyota',
    capacity: 5,
  },
  {
    id: 'vehicle2',
    name: 'Honda',
    capacity: 4,
  },
  {
    id: 'vehicle3',
    name: 'Acura',
    capacity: 4,
  },
];
const testDrivers = [
  {
    id: 'driver0',
    email: 'drivertest-email@test.com',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'Testing',
    vehicle: testVehicles[0].id,
    startDate: '2023-03-09',
    availability: {
      Mon: {
        startTime: '08:00',
        endTime: '12:00',
      },
      Tue: {
        startTime: '08:00',
        endTime: '12:00',
      },
      Wed: {
        startTime: '08:00',
        endTime: '12:00',
      },
      Thu: {
        startTime: '08:00',
        endTime: '12:00',
      },
      Fri: {
        startTime: '08:00',
        endTime: '12:00',
      },
    },
    photoLink: '',
  },
  {
    id: 'driver1',
    email: 'drivertest-email1@test.com',
    phoneNumber: '1234567891',
    firstName: 'Test',
    lastName: 'Testing1',
    vehicle: testVehicles[1].id,
    startDate: '2023-03-10',
    availability: {
      Mon: {
        startTime: '09:00',
        endTime: '12:00',
      },
      Tue: {
        startTime: '11:00',
        endTime: '12:00',
      },
      Wed: {
        startTime: '12:00',
        endTime: '17:00',
      },
      Thu: {
        startTime: '15:00',
        endTime: '16:00',
      },
    },
    photoLink: '',
  },
];

const testLocations: LocationType[] = [
  {
    id: '1',
    name: 'Test-Location 1',
    address: '123 Test Location',
    tag: Tag.WEST,
    info: 'Test Info 1',
    shortName: 'Test-1',
    lat: 44.123456,
    lng: -76.123456,
  },
  {
    id: '2',
    name: 'Test-Location 2',
    address: '321 Test Drive',
    tag: Tag.NORTH,
    info: 'Test Info 2',
    shortName: 'Test-2',
    lat: 45.123456,
    lng: -77.123456,
  },
];

const testRides = [
  {
    id: 'test-ride0',
    type: Type.PAST,
    status: Status.COMPLETED,
    late: false,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract({ days: 7, hours: 6 }).toISOString(),
    endTime: moment().subtract({ days: 7, hours: 5 }).toISOString(),
    rider: testStatRider.id,
    driver: testDrivers[0].id,
    recurring: false,
    recurringDays: undefined,
    endDate: undefined,
    deleted: undefined,
    edits: undefined,
    parentRide: undefined,
  },
  {
    id: 'test-ride1',
    type: Type.PAST,
    status: Status.COMPLETED,
    late: false,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract({ days: 7, hours: 4 }).toISOString(),
    endTime: moment().subtract({ days: 7, hours: 3 }).toISOString(),
    rider: testStatRider.id,
    driver: testDrivers[0].id,
    recurring: false,
    recurringDays: undefined,
    endDate: undefined,
    deleted: undefined,
    edits: undefined,
    parentRide: undefined,
  },
  {
    id: 'test-ride2',
    type: Type.PAST,
    status: Status.NO_SHOW,
    late: false,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract({ days: 7, hours: 2 }).toISOString(),
    endTime: moment().subtract({ days: 7, hours: 1 }).toISOString(),
    rider: testStatRider.id,
    driver: testDrivers[0].id,
    recurring: false,
    recurringDays: undefined,
    endDate: undefined,
    deleted: undefined,
    edits: undefined,
    parentRide: undefined,
  },
];

describe('Testing Functionality of Drivers Endpoints', () => {
  let adminToken: string;
  let riderToken: string;
  let driverToken: string;
  before(async () => {
    adminToken = await authorize('Admin', testAdmin);
    riderToken = await authorize('Rider', testRider);
    await Promise.all(
      testVehicles.map((vehicle) => populateDB(Vehicle, vehicle))
    );
    driverToken = await authorize('Driver', testDrivers[0]);
    await Promise.all(
      testDrivers.slice(1).map((driver) => populateDB(Driver, driver))
    );
    await populateDB(Rider, testStatRider);
    await Promise.all(
      testLocations.map((location) => populateDB(Location, location))
    );
    await Promise.all(testRides.map((ride) => populateDB(Ride, ride)));
  });

  after(clearDB);

  // testing retrieval of specific driver
  describe('Testing get driver by Id', () => {
    const generateGetDriverTest = async (authToken: string) => {
      // testDrivers is stored with drivers where the vehicle field contains the vehicle ID
      // we need the vehicle field to contain the entire vehicle object
      const { vehicle, ...driverObj } = testDrivers[0];
      const driverWithVehicleObj = { ...driverObj, vehicle: testVehicles[0] };
      const res = await request(app)
        .get('/api/drivers/driver0')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(driverWithVehicleObj);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetDriverTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetDriverTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of all drivers
  describe('GET all drivers', () => {
    const generateAllDriversTest = async (authToken: string) => {
      // testDrivers is stored with drivers where the vehicle field contains the vehicle ID
      // we need the vehicle field to contain the entire vehicle object
      const driversWithVehicles = testDrivers.map((driver) => {
        const { vehicle, ...driverObj } = driver;
        const driverWithVehicleObj = {
          ...driverObj,
          vehicle: testVehicles.filter(
            (testVehicle) => testVehicle.id == vehicle
          )[0],
        };
        return driverWithVehicleObj;
      });
      const res = await request(app)
        .get('/api/drivers/')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      authToken === adminToken
        ? (expect(res.status).to.be.equal(200),
          expect(res.body).to.have.property('data'),
          expect(res.body.data).to.deep.equal(driversWithVehicles))
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateAllDriversTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateAllDriversTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateAllDriversTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/drivers/').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of driver profile
  describe('GET a driver profile by ID', () => {
    const generateGetDriverProfileTest = async (authToken: string) => {
      // testDrivers is stored with drivers where the vehicle field contains the vehicle ID
      // we need the vehicle field to contain the entire vehicle object
      const { id, photoLink, startDate, vehicle, ...driverProfile } =
        testDrivers[0];
      const driverProfileWithVehicle = {
        ...driverProfile,
        vehicle: testVehicles[0],
      };
      const res = await request(app)
        .get('/api/drivers/driver0/profile')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(driverProfileWithVehicle);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetDriverProfileTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetDriverProfileTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetDriverProfileTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/drivers/driver0/profile')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of available drivers
  describe('GET all available drivers for a specific date and time', () => {
    const generateGetDriverAvailabilityTest = async (authToken: string) => {
      // next mondays date
      const res = await request(app)
        .get(
          '/api/drivers/available?date=2023-04-17&startTime=09:01&endTime=10:01'
        )
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      // all drivers are available at this time so we get all of them with their populated fields
      const drivers = await request(app)
        .get('/api/drivers/')
        .auth(adminToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');

      authToken === adminToken ||
      authToken === driverToken ||
      authToken === riderToken
        ? expect(res.body.data).to.deep.equal(drivers.body.data)
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetDriverAvailabilityTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetDriverAvailabilityTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetDriverAvailabilityTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      generateGetDriverAvailabilityTest('');
    });
  });

  // testing the retrieval of a driver's stats
  describe("GET a driver's stats", () => {
    const driverStats = {
      rides: 2,
      workingHours: 20,
    };
    const generateGetDriverStatsTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/drivers/driver0/stats')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      authToken === adminToken
        ? expect(res.body.data).to.deep.equal(driverStats)
        : expect(res.status).to.be.equal(400);
    };
    // completed 2 of 3 rides (one no show) and completed 20 hours of work
    it('should return correct response for Admin account', async () =>
      await generateGetDriverStatsTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateGetDriverStatsTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateGetDriverStatsTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/drivers/driver0/stats')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the addition of a new driver
  describe('Create a new driver', () => {
    const generateCreateDriverTest = async (authToken: string) => {
      const newDriverData = {
        email: 'drivertest3-email@test.com',
        phoneNumber: '1234567890',
        firstName: 'Test',
        lastName: 'Testing',
        vehicle: testVehicles[2].id,
        startDate: '2023-03-09',
        availability: {
          Mon: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Tue: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Wed: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Thu: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Fri: {
            startTime: '8:00',
            endTime: '12:00',
          },
        },
        photoLink: '',
        admin: true,
      };
      const { vehicle, ...driverObj } = newDriverData;
      const driverWithVehicleObj = { ...driverObj, vehicle: testVehicles[2] };
      const res = await request(app)
        .post('/api/drivers/')
        .send(newDriverData)
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      authToken === adminToken
        ? async () => {
            const sentData = { ...res.body.data };
            // this is randomly generated and cannot be tested for,
            // but the accuracy of the rest of the data can be
            delete sentData.id;
            expect(sentData).to.deep.equal(driverWithVehicleObj);
            // retrieve this new rider
            const res2 = await request(app)
              .get(`/api/drivers/${res.body.data.id}`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            const retrievedData = res2.body.data;
            delete retrievedData.id;
            expect(retrievedData).to.deep.equal(driverWithVehicleObj);
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateCreateDriverTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateCreateDriverTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateCreateDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).post('/api/drivers/').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the updating of info of a driver
  describe('PUT new information for a driver by id driver0', () => {
    const generateUpdateDriverTest = async (authToken: string) => {
      const res = await request(app)
        .put('/api/drivers/driver0')
        .send({ firstName: 'NewName' })
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      authToken === adminToken || authToken === driverToken
        ? async () => {
            expect(res.body.data.firstName).to.be.equal('NewName');
            // retrieve driver and see if there is a new name
            const res2 = await request(app)
              .get(`/api/drivers/driver0`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            expect(res2.body.data.firstName).to.be.equal('NewName');
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateUpdateDriverTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateUpdateDriverTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateUpdateDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).put('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the deletion of a driver
  describe('DELETE a driver by id driver0', () => {
    const generateDeleteDriverTest = async (authToken: string) => {
      const res = await request(app)
        .delete('/api/drivers/driver0')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      authToken === adminToken
        ? async () => {
            // retrieve driver and see if it is deleted
            const res2 = await request(app)
              .get(`/api/drivers/driver0`)
              .auth(authToken, { type: 'bearer' })
              .expect(400)
              .expect('content-type', 'application/json; charset=utf-8');
            expect(res2.body).have.property('err');
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () => {
      await generateDeleteDriverTest(adminToken);
    });
    it('should fail with 400 given Driver account', async () => {
      await generateDeleteDriverTest(driverToken);
    });
    it('should fail with 400 given Rider account', async () => {
      await generateDeleteDriverTest(riderToken);
    });
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).delete('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });
});
