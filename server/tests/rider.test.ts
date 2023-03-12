import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Rider } from '../src/models';
import { clearDB, populateDB } from './utils/db';

let adminToken: string;
const riders = [
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
    favoriteLocations: ['RedRunner'],
    organization: 'CULift',
    photoLink: '',
    active: true,
  },
];

describe('Testing Functionality of Riders Endpoints', () => {
  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
    riders.forEach(async (rider) => {
      await populateDB(Rider, rider);
    });
  });

  after(clearDB);

  // testing retrieval of specific rider
  describe('Testing Get Rider by Id', () => {
    it('should fetch rider with id abc-10', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(riders[0]);
    });
  });

  // testing retrieval of all riders
  describe('GET all riders', () => {
    it('should return all riders', async () => {
      const res = await request(app)
        .get('/api/riders/')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data.reverse()).to.deep.equal(riders);
    });
  });

  const riderProfile = {
    email: 'test-email@test.com',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'Testing',
    pronouns: 'he/him/his',
    joinDate: '2023-03-09',
    endDate: '2024-03-09',
  };
  // testing retrieval of rider profile
  describe('GET a rider profile by ID', () => {
    it("should return rider's profile with id abc-10", async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderProfile);
    });
  });

  const riderOrganization = {
    organization: riders[0].organization,
    description: riders[0].description,
  };
  // testing retrieval of org info
  describe("GET a rider's organization by the rider's ID", () => {
    it("should return rider's organization with id abc-10", async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/organization')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderOrganization);
    });
  });

  const riderAccessibility = {
    accessibility: riders[0].accessibility,
    description: riders[0].description,
  };
  // testing retrieval of accessibility info
  describe("GET a rider's accessiblity by the rider's ID", () => {
    it("should return rider's accessibility with id abc-10", async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/accessibility')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderAccessibility);
    });
  });

  // testing retrieval of favorite locations
  // *******************************************************************************
  // note at the moment I don't think favorites works, it just returns an empty list
  // *******************************************************************************
  describe("GET a rider's favorite locations by the rider's ID", () => {
    it("should return rider's favorite locations with id abc-10", async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/favorites')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(riders[0].favoriteLocations);
    });
  });

  const newRiderData = {
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
  describe('Create a new rider', () => {
    it('should return the data of the new rider', async () => {
      const res = await request(app)
        .post('/api/riders/')
        .send(newRiderData)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const sentData = { ...res.body.data };
      // this is randomly generated and cannot be tested for,
      // but the accuracy of the rest of the data can be
      delete sentData.id;
      expect(sentData).to.deep.equal(newRiderData);
      // retrieve this new rider
      const res2 = await request(app)
        .get(`/api/riders/${res.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      const retrievedData = res2.body.data;
      delete retrievedData.id;
      expect(retrievedData).to.deep.equal(newRiderData);
    });
  });

  // testing the addition of a favorite location for a rider
  // ***************************************************
  // getting a 400 bad request for some reason
  // ***************************************************
  describe('POST a new favorite location for a rider', () => {
    it('should return the new location', async () => {
      const res = await request(app)
        .post('/api/riders/abc-10/favorites')
        .send({ id: 'central' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const favoriteLocations = riders[0].favoriteLocations;
      favoriteLocations.push('central');
      expect(res.body.id).to.deep.equal(
        favoriteLocations[favoriteLocations.length - 1]
      );
      // retrieve this rider's new favorite location list
      const res2 = await request(app)
        .get(`/api/riders/abc-10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(res2.body.data.favoriteLocations).to.deep.equal(favoriteLocations);
    });
  });

  // testing the updating of info of a rider
  describe('PUT new information for a rider by id abc-10', () => {
    it('should return all fields in the document of the rider', async () => {
      const res = await request(app)
        .put('/api/riders/abc-10')
        .send({ firstName: 'NewName' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body.data.firstName).to.be.equal('NewName');
      // retrieve rider and see if there is a new name
      const res2 = await request(app)
        .get(`/api/riders/abc-10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(res2.body.data.firstName).to.be.equal('NewName');
    });
  });

  // testing the deletion of a rider
  describe('DELETE a rider by id abc-10', () => {
    it("should return the deleted rider's UUID", async () => {
      const res = await request(app)
        .delete('/api/riders/abc-10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.body).to.deep.equal({ id: 'abc-10' });

      // try to fetch the deleted rider's information; should return 400 error
      const res2 = await request(app)
        .get('/api/riders/abc-10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(res2.body).to.deep.equal({ err: 'id not found in Riders' });
    });
  });
});
