import request from 'supertest';
import { expect } from 'chai';
import authorize from './utils/auth';
import { clearDB } from './utils/db';
import app from '../src/app';

// Basic Data: Non-recurring ride
const testRideRequest1 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: false,
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
};

// Recurring Ride Post Request Data
const testRideRequest2 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: true,
  recurringDays: [1, 2, 3, 4, 5],
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
  endDate: '2023-05-25',
};

// GET Request data from testRideRequest2
const testRideResponse2 = {
  startLocation: {
    name: '321 Test Drive',
    address: '321 Test Drive',
    tag: 'custom',
  },
  endLocation: {
    name: '321 Test Drive',
    address: '321 Test Drive',
    tag: 'custom',
  },
  recurring: true,
  recurringDays: [1, 2, 3, 4, 5],
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
  endDate: '2023-05-25',
  id: '',
  edits: [],
  deleted: [],
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};

// Updated data for put request
const putReq1 = {
  startLocation: '678 Test Lane',
  endLocation: '12 NewTest Road',
  recurringDays: [2, 3, 4],
  startTime: '2023-03-30T13:55:00.000Z',
  endTime: '2023-04-22T23:55:00.000Z',
};

// GET Request response after PUT Request for testRideRequest2 and putReq1
const testRideResponse3 = {
  startLocation: {
    name: '678 Test Lane',
    address: '678 Test Lane',
    tag: 'custom',
  },
  endLocation: {
    name: '12 NewTest Road',
    address: '12 NewTest Road',
    tag: 'custom',
  },
  recurring: true,
  recurringDays: [2, 3, 4],
  startTime: '2023-03-30T13:55:00.000Z',
  endTime: '2023-04-22T23:55:00.000Z',
  endDate: '2023-05-25',
  id: '',
  edits: [],
  deleted: [],
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};

// Invalid POST Request data
const testRideReq4 = {
  startLocation: '321 Test Drive',
  endLocation: '321 Test Drive',
  recurring: true,
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
};

// Start Location POST Requst Data
const startLoc = {
  name: 'Toni Morrison Hall',
  address: '18 Sisson Pl',
  tag: 'north',
  info: 'In front of dining hall',
};

// End Location POST Request Data
const endLoc = {
  name: '7/11',
  address: '409 College Ave',
  tag: 'ctown',
  info: 'In front of building',
};

// POST reqeust data with existing locations
const testRideRequest5 = {
  startLocation: '',
  endLocation: '',
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
};

// GET response for testRideRequest5 after adding locations
const testRideResponse5 = {
  startLocation: {
    name: 'Toni Morrison Hall',
    address: '18 Sisson Pl',
    tag: 'north',
    info: 'In front of dining hall',
    id: '',
  },
  endLocation: {
    name: '7/11',
    address: '409 College Ave',
    tag: 'ctown',
    info: 'In front of building',
    id: '',
  },
  recurring: false,
  startTime: '2022-01-31T23:50:00.000Z',
  endTime: '2022-01-31T23:55:00.000Z',
  id: '',
  type: 'unscheduled',
  status: 'not_started',
  late: false,
};

describe('Rides Tests', () => {
  let adminToken: string;

  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
  });
  after(clearDB);

  describe('POST & GET & DELETE /api/rides', () => {
    it('Creates a new ride and compares response with same one requested', async () => {
      const postRes = await request(app)
        .post('/api/rides')
        .send(testRideRequest1)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const rideId = postRes.body['id'];

      const getRes = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(getRes.body.data).to.deep.equal(postRes.body);

      const delRes = await request(app)
        .delete(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(delRes.body['id']).equals(rideId);
    });
  });

  describe('DELETE /api/rides with an id that does not exist in db', () => {
    it('Should return an error that the id is not found in the rides db', async () => {
      const randomId = 'nonexistant-id';
      const delRes = await request(app)
        .delete(`/api/rides/${randomId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(delRes.body['err']).equals('id not found in Rides');
    });
  });

  describe('POST indicating reurring ride but no recurring days or end date', () => {
    it('Should return error sayign invalid repeatind ride', async () => {
      const postRes = await request(app)
        .post('/api/rides')
        .send(testRideReq4)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
      expect(postRes.body['err']).equals('Invalid repeating ride.');
    });
  });

  describe('POST & GET /api/rides with recurring days', () => {
    it('Creates a recurring ride and', async () => {
      const postRes = await request(app)
        .post('/api/rides')
        .send(testRideRequest2)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const rideId = postRes.body['id'];
      testRideResponse2.id = rideId;
      const getRes = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(getRes.body.data).to.deep.equal(postRes.body);
    });
  });

  describe('PUT /api/rides/:id', () => {
    it('Creates ride and updates data', async () => {
      const postRes = await request(app)
        .post('/api/rides')
        .send(testRideRequest2)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const rideId = postRes.body['id'];
      testRideResponse3.id = rideId;
      const putRes = await request(app)
        .put(`/api/rides/${rideId}`)
        .send(putReq1)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(putRes.body).to.deep.equal(testRideResponse3);
    });
  });

  describe('POST /api/rides with exiting locations', () => {
    it('Creates start and end location and uses these to create a new ride', async () => {
      const startLocRes = await request(app)
        .post('/api/locations')
        .send(startLoc)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const startLocResId = startLocRes.body.data['id'];
      const endLocRes = await request(app)
        .post('/api/locations')
        .send(endLoc)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const endLocResId = endLocRes.body.data['id'];

      testRideRequest5.startLocation = startLocResId;
      testRideRequest5.endLocation = endLocResId;

      const postRes = await request(app)
        .post('/api/rides')
        .send(testRideRequest5)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const rideId = postRes.body['id'];
      testRideResponse5.id = rideId;
      testRideResponse5.startLocation.id = startLocResId;
      testRideResponse5.endLocation.id = endLocResId;

      const getRes = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(getRes.body.data).to.deep.equal(testRideResponse5);
    });
  });
});
