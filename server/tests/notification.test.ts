import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Location } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { AdminType } from '../src/models/admin';
import { DriverType } from '../src/models/driver';
import { Organization, RiderType } from '../src/models/rider';

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
  favoriteLocations: ['Test-Location 1'],
  organization: Organization.REDRUNNER,
  photoLink: '',
  active: true,
};
describe('Testing Notifications', () => {
  let adminToken: string;
  let driverToken: string;
  let riderToken: string;
  before(async () => {
    adminToken = await authorize('Admin', testAdmin);
    driverToken = await authorize('Driver', testDriver);
    riderToken = await authorize('Rider', testRider);
  });
  after(clearDB);
  // describe('GET /api/locations', () => {
  //   it('should return 200 OK', async () => {
  //     const res = await request(app)
  //       .get('/api/locations')
  //       .set('Authorization', `Bearer ${adminToken}`)
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8');
  //     expect(res.status).to.be.equal(200);
  //     expect(res.body).to.have.property('data');
  //     expect(res.body.data).to.be.an('array').and.to.have.lengthOf(1);
  //   });
  // });
});
