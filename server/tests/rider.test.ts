import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Rider, Location, Vehicle } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { Organization } from '../src/models/rider';
import { LocationType, Tag } from '@carriage-web/shared/src/types/location';
import { AdminType } from '@carriage-web/shared/src/types/admin';
import { Ride, Status, Type } from '../src/models/ride';
import moment from 'moment';

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

const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
  type: ['sds-admin'],
  isDriver: false,
};

const testVehicle = {
  id: '1',
  name: 'Hot Wheels',
  capacity: 2,
};

const testDriver = {
  id: 'driver0',
  email: 'drivertest-email@test.com',
  phoneNumber: '1234567890',
  firstName: 'Test',
  lastName: 'Testing',
  vehicle: testVehicle.id,
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
};

const testRiders = [
  {
    id: 'abc-10',
    email: 'test-email@test.com',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'Testing',
    pronouns: 'he/him/his',
    accessibility: 'Crutches',
    description: '',
    joinDate: '2023-03-09',
    endDate: '2024-03-09',
    address: '36 Colonial Ln, Ithaca, NY 14850',
    favoriteLocations: ['1'],
    organization: Organization.REDRUNNER,
    photoLink: '',
    active: true,
  },
  {
    id: 'abc-11',
    email: 'test-email1@test.com',
    phoneNumber: '1234567891',
    firstName: 'Test',
    lastName: 'Testing1',
    pronouns: 'he/him/his',
    accessibility: 'Crutches',
    description: 'needs help',
    joinDate: '2023-03-09',
    endDate: '2024-03-09',
    address: '37 Colonial Ln, Ithaca, NY 14850',
    favoriteLocations: ['2'],
    organization: Organization.CULIFT,
    photoLink: '',
    active: true,
  },
];

const testRides = [
  {
    id: 'test-ride0',
    type: Type.PAST,
    status: Status.NO_SHOW,
    late: false,
    startLocation: testLocations[0].id,
    endLocation: testLocations[1].id,
    startTime: moment().subtract(20, 'minutes').toISOString(),
    endTime: moment().subtract(40, 'minutes').toISOString(),
    rider: testRiders[0].id,
    driver: testDriver.id,
    recurring: false,
    recurringDays: undefined,
    endDate: undefined,
    deleted: undefined,
    edits: undefined,
    parentRide: undefined,
  },
  {
    id: 'test-ride1',
    type: Type.ACTIVE,
    status: Status.NOT_STARTED,
    late: false,
    startLocation: testLocations[1].id,
    endLocation: testLocations[0].id,
    startTime: moment().add(20, 'minutes').toISOString(),
    endTime: moment().add(30, 'minutes').toISOString(),
    rider: testRiders[0].id,
    driver: testDriver.id,
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
    status: Status.COMPLETED,
    late: false,
    startLocation: testLocations[1].id,
    endLocation: testLocations[0].id,
    startTime: moment().subtract(60, 'minutes').toISOString(),
    endTime: moment().subtract(50, 'minutes').toISOString(),
    rider: testRiders[0].id,
    driver: testDriver.id,
    recurring: false,
    recurringDays: undefined,
    endDate: undefined,
    deleted: undefined,
    edits: undefined,
    parentRide: undefined,
  },
];

describe('Testing Functionality of Riders Endpoints', () => {
  let adminToken: string;
  let driverToken: string;
  let riderToken: string;
  before(async () => {
    await Promise.all(
      testLocations.map((location) => populateDB(Location, location))
    );
    adminToken = await authorize('Admin', testAdmin);
    driverToken = await authorize('Driver', testDriver);
    riderToken = await authorize('Rider', testRiders[0]);
    await Promise.all(
      testRiders.slice(1).map((rider) => populateDB(Rider, rider))
    );
    await populateDB(Vehicle, testVehicle);
    await Promise.all(testRides.map((ride) => populateDB(Ride, ride)));
  });

  after(clearDB);

  // fetching rider usage
  describe('Testing retrieval of rider usage', () => {
    const rider0usage = {
      studentRides: 1,
      noShowCount: 1,
    };
    const generateGetRiderUsageTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/riders/abc-10/usage')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      if (authToken === adminToken) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal(rider0usage);
      } else {
        expect(res.status).to.be.equal(400);
      }
    };
    it('should return correct response for Admin account', async () =>
      await generateGetRiderUsageTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateGetRiderUsageTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateGetRiderUsageTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/usage')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of rider's current ride
  describe("Testing Get Rider's Current/Soonest ride Within 30 Minutes", () => {
    const generateGetCurrRideTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/riders/abc-10/currentride')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      const ride = await request(app)
        .get(`/api/rides/${testRides[1].id}`)
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      if (authToken === adminToken || authToken === riderToken) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.deep.equal(ride.body.data);
      } else {
        expect(res.status).to.be.equal(400);
      }
    };
    it('should return correct response for Admin account', async () =>
      await generateGetCurrRideTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateGetCurrRideTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetCurrRideTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/currentride')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of specific rider by ID
  describe('Testing Get Rider by Id', () => {
    const generateGetRiderTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/riders/abc-10')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(testRiders[0]);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetRiderTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetRiderTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetRiderTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/riders/abc-10').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of all riders
  describe('Testing fetching all riders', () => {
    const generateGetAllRidersTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/riders/')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      if (authToken === adminToken) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.reverse()).to.deep.equal(testRiders);
      } else {
        expect(res.status).to.be.equal(400);
      }
    };
    it('should return correct response for Admin account', async () =>
      await generateGetAllRidersTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateGetAllRidersTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateGetAllRidersTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/riders/').expect(400);
      expect(res.body).have.property('err');
    });
  });
});
