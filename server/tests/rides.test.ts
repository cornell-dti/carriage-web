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

  describe('DELETE Request with an id that does not exist in db', () => {
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
});
