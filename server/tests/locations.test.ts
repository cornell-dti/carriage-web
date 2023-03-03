import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Location } from '../src/models';
import { clearDB, populateDB } from './utils/db';

let adminToken: string;

describe('Locations', () => {
  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
    await populateDB(Location, {
      name: 'Test-Location',
      address: '123 Test Location',
      tag: 'west',
      info: 'Test Info',
    });
  });

  after(clearDB);

  describe('GET /api/locations', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/locations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array').and.to.have.lengthOf(2);
    });
  });
});
