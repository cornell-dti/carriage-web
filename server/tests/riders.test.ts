import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Rider } from '../src/models';
import { clearDB, populateDB } from './utils/db';

let adminToken: string;
const rider = [
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
    favoriteLocations: ['west'],
    organization: 'CULift',
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
    description: '',
    joinDate: '2023-03-09',
    endDate: '2024-03-09',
    address: '37 Colonial Ln, Ithaca, NY 14850',
    favoriteLocations: ['west'],
    organization: 'CULift',
    photoLink: '',
    active: true,
  },
];

describe('Riders', () => {
  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
    await populateDB(Rider, {
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
      favoriteLocations: ['west'],
      organization: 'CULift',
      photoLink: '',
      active: true,
    });
    // add second rider
    await populateDB(Rider, {
      id: 'abc-11',
      email: 'test-email1@test.com',
      phoneNumber: '1234567891',
      firstName: 'Test',
      lastName: 'Testing1',
      pronouns: 'he/him/his',
      accessibility: 'Crutches',
      description: '',
      joinDate: '2023-03-09',
      endDate: '2024-03-09',
      address: '37 Colonial Ln, Ithaca, NY 14850',
      favoriteLocations: ['west'],
      organization: 'CULift',
      photoLink: '',
      active: true,
    });
  });

  after(clearDB);

  // testing retrieval of specific rider
  describe('GET /api/riders/abc-10', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(rider[0]);
    });
  });

  // testing retrieval of all riders
  describe('GET /api/riders', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data.reverse()).to.deep.equal(rider);
    });
  });

  // testing retrieval of rider profile
  describe('GET /api/riders/abc-10/profile', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body.email).to.be.equal(rider[0].email);
      expect(res.body.phoneNumber).to.be.equal(rider[0].phoneNumber);
      expect(res.body.firstName).to.be.equal(rider[0].firstName);
      expect(res.body.lastName).to.be.equal(rider[0].lastName);
      expect(res.body.pronouns).to.be.equal(rider[0].pronouns);
      expect(res.body.joinDate).to.be.equal(rider[0].joinDate);
      expect(res.body.endDate).to.be.equal(rider[0].endDate);
    });
  });

  // testing retrieval of org info
  describe('GET /api/riders/abc-10/organization', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/organization')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body.organization).to.be.equal(rider[0].organization);
      expect(res.body.description).to.be.equal(rider[0].description);
    });
  });

  // testing retrieval of accessibility info
  describe('GET /api/riders/abc-10/accessibility', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/accessibility')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body.accessibility).to.be.equal(rider[0].accessibility);
      expect(res.body.description).to.be.equal(rider[0].description);
    });
  });

  // testing retrieval of favorite locations
  // *******************************************************************************
  // note at the moment I don't think favorites works, it just returns an empty list
  // *******************************************************************************
  describe('GET /api/riders/abc-10/favorites', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/favorites')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(rider[0].favoriteLocations);
    });
  });

  const sendRidersData = {
    email: 'test-email2@test.com',
    phoneNumber: '1234567892',
    firstName: 'Test',
    lastName: 'Testing2',
    pronouns: 'he/him/his',
    accessibility: 'Crutches',
    description: '',
    joinDate: '2023-03-09',
    endDate: '2024-03-09',
    address: '3 Colonial Ln, Ithaca, NY 14850',
    favoriteLocations: ['west'],
    organization: 'CULift',
    photoLink: '',
    active: true,
  };

  // testing the addition of a new rider
  describe('POST /api/riders', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .post('/api/riders/')
        .send(sendRidersData)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const sentData = { ...res.body.data };
      // this is randomly generated and cannot be tested for,
      // but the accuracy of the rest of the data can be
      delete sentData.id;
      expect(sentData).to.deep.equal(sendRidersData);
    });
  });

  // testing the addition of a favorite location for a rider
  // ***************************************************
  // getting a 400 bad request for some reason
  // ***************************************************
  describe('POST /api/riders/abc-10/favorites', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .post('/api/riders/abc-10/favorites')
        .send({ id: 'central' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body.id).to.deep.equal(
        rider[0].favoriteLocations[rider[0].favoriteLocations.length - 1]
      );
    });
  });

  // testing the updating of info of a rider
  describe('PUT /api/riders/abc-10', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .put('/api/riders/abc-10')
        .send({ firstName: 'NewName' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body.data.firstName).to.be.equal('NewName');
    });
  });

  // testing the deletion of a rider
  describe('DELETE /api/riders/abc-10', () => {
    it('should return 200 OK', async () => {
      const res = await request(app)
        .delete('/api/riders/abc-10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body).to.deep.equal({ id: 'abc-10' });
    });
  });
});
