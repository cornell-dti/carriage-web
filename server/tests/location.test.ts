import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Location } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { LocationType, Tag } from '@carriage-web/shared/types/location';

const testAdmin = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
  type: ['sds-admin'],
};

const testDriver = {
  firstName: 'Test-Driver',
  lastName: 'Test-Driver',
  phoneNumber: '2222222222',
  startDate: 'start date',
  email: 'test-driver@cornell.edu',
};

const testRider = {
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
