import request from 'supertest';
import { expect } from 'chai';
import authorize from './utils/auth';
import { clearDB } from './utils/db';
import app from '../src/app';
import {
  endLoc,
  putReq1,
  startLoc,
  testRideReq4,
  testRideRequest1,
  testRideRequest2,
  testRideResponse2,
  testRideResponse3,
  testRideResponse5,
  testRideRequest5,
} from './ride-test-data';

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
  after(clearDB);
  describe('GET /api/rides/?date=DATE', () => {
    it('Retrieves all rides in the specified date', async () => {
      const date = '2022-01-31';

      const postRes1 = await request(app)
        .post('/api/rides')
        .send(testRideRequest1)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const postRes2 = await request(app)
        .post('/api/rides')
        .send(testRideRequest2)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const getRes = await request(app)
        .get(`/api/rides/?date=${date}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(getRes.body.data.length).to.equal(3);
    });
  });
});
