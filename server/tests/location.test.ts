import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Location } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { AdminType } from '../src/models/admin';
import { LocationType, Tag } from '../src/models/location';
import { DriverType } from '../src/models/driver';
import { RiderType } from '../src/models/rider';

const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
};

const testDriver: Omit<DriverType, 'id'> = {
  firstName: 'Test-Driver',
  lastName: 'Test-Driver',
  availability: {
    Mon: undefined,
    Tue: undefined,
    Wed: undefined,
    Thu: undefined,
    Fri: undefined,
  },
  vehicle: {
    id: '1',
    name: 'Hot Wheels',
    capacity: 2,
  },
  phoneNumber: '2222222222',
  startDate: 'start date',
  email: 'test-driver@cornell.edu',
  admin: false,
};

const testRider: Omit<RiderType, 'id'> = {
  firstName: 'Test-Rider',
  lastName: 'Test-Rider',
  phoneNumber: '3333333333',
  email: 'test-rider@cornell.edu',
  joinDate: '2022-01-22',
  endDate: '2023-01-22',
  address: '123 Rider Street',
  favoriteLocations: [],
  active: true,
};

const testLocations: LocationType[] = [
  {
    id: '1',
    name: 'Test-Location 1',
    address: '123 Test Location',
    tag: Tag.WEST,
    info: 'Test Info 1',
  },
  {
    id: '2',
    name: 'Test-Location 2',
    address: '321 Test Drive',
    tag: Tag.NORTH,
    info: 'Test Info 2',
  },
];

const testLocationData = (val: any) => {
  expect(val).to.have.property('id');
  const match = testLocations.find((l) => l.id === val.id);
  if (!match) {
    expect.fail('location returned from api does not match test data');
  }
  expect(val).to.have.property('name', match.name);
  expect(val).to.have.property('address', match.address);
  expect(val).to.have.property('tag', match.tag);
  expect(val).to.have.property('info', match.info);
};

describe('/locations tests', () => {
  let adminToken: string;
  let driverToken: string;
  let riderToken: string;

  before(async () => {
    adminToken = await authorize('Admin', testAdmin);
    driverToken = await authorize('Driver', testDriver);
    riderToken = await authorize('Rider', testRider);
    await Promise.all(testLocations.map((data) => populateDB(Location, data)));
  });

  after(clearDB);

  describe('GET /api/locations', () => {
    const testWithToken = async (authToken: string) => {
      const res = await request(app)
        .get('/api/locations')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data)
        .to.be.an('array')
        .and.to.have.lengthOf(testLocations.length);
      (res.body.data as any[]).forEach(testLocationData);
    };
    it('should return correct response for Admin account', async () =>
      await testWithToken(adminToken));
    it('should return correct response for Driver account', async () =>
      await testWithToken(driverToken));
    it('should return correct response for Rider account', async () =>
      await testWithToken(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/locations').expect(400);
      expect(res.body).have.property('err');
    });
  });

  describe('GET /api/locations/:id', () => {
    const testWithToken = async (authToken: string, id: string) => {
      const res = await request(app)
        .get(`/api/locations/${id}`)
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      testLocationData(res.body.data);
    };
    const testErrorWithToken = async (authToken: string, id: string) => {
      const res = await request(app)
        .get(`/api/locations/${id}`)
        .auth(authToken, { type: 'bearer' })
        .expect(400);
      expect(res.body).to.have.property('err');
    };
    it('should return correct response for Admin account', async () =>
      await Promise.all([
        testWithToken(adminToken, '1'),
        testWithToken(adminToken, '2'),
        testErrorWithToken(adminToken, '3'),
        testErrorWithToken(adminToken, 'hello'),
      ]));
    it('should return correct response for Driver account', async () =>
      await Promise.all([
        testWithToken(driverToken, '1'),
        testWithToken(driverToken, '2'),
        testErrorWithToken(driverToken, '3'),
        testErrorWithToken(driverToken, 'hello'),
      ]));
    it('should return correct response for Rider account', async () =>
      await Promise.all([
        testWithToken(riderToken, '1'),
        testWithToken(riderToken, '2'),
        testErrorWithToken(riderToken, '3'),
        testErrorWithToken(riderToken, 'hello'),
      ]));
    it('some id should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/locations/1').expect(400);
      expect(res.body).have.property('err');
    });
  });
});
