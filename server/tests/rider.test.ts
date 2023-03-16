import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Rider, Location } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { RiderType, Organization } from '../src/models/rider';
import { LocationType, Tag } from '../src/models/location';
import { AdminType } from '../src/models/admin';
import { DriverType } from '../src/models/driver';
import { auth } from 'google-auth-library';

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

const testRiders: RiderType[] = [
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
    favoriteLocations: ['Test-Location 1'],
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
    favoriteLocations: ['Test-Location 2'],
    organization: Organization.CULIFT,
    photoLink: '',
    active: true,
  },
];

describe('Testing Functionality of Riders Endpoints', () => {
  let adminToken: string;
  let driverToken: string;
  let riderToken: string;
  before(async () => {
    adminToken = await authorize('Admin', testAdmin);
    driverToken = await authorize('Driver', testDriver);
    riderToken = await authorize('Rider', testRiders[0]);
    await Promise.all(
      testRiders.slice(1).map((rider) => populateDB(Rider, rider))
    );
    await Promise.all(testLocations.map((data) => populateDB(Location, data)));
  });

  after(clearDB);

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
      res.status === 200
        ? (expect(res.status).to.be.equal(200),
          expect(res.body).to.have.property('data'),
          expect(res.body.data.reverse()).to.deep.equal(testRiders))
        : expect(res.status).to.be.equal(400);
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

  // testing retrieval of rider profile
  describe('GET a rider profile by ID', () => {
    const generateGetRiderProfileTest = async (authToken: string) => {
      const riderProfile = {
        email: 'test-email@test.com',
        phoneNumber: '1234567890',
        firstName: 'Test',
        lastName: 'Testing',
        pronouns: 'he/him/his',
        joinDate: '2023-03-09',
        endDate: '2024-03-09',
      };
      const res = await request(app)
        .get('/api/riders/abc-10/profile')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderProfile);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetRiderProfileTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetRiderProfileTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetRiderProfileTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/profile')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of org info
  describe('GET a rider organization by ID', () => {
    const generateGetRiderOrgTest = async (authToken: string) => {
      const riderOrganization = {
        organization: testRiders[0].organization,
        description: testRiders[0].description,
      };
      const res = await request(app)
        .get('/api/riders/abc-10/organization')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderOrganization);
    };

    it('should return correct response for Admin account', async () =>
      await generateGetRiderOrgTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetRiderOrgTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetRiderOrgTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/organization')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of accessibility info
  describe("GET a rider's accessiblity by the rider's ID", () => {
    const generateGetRiderAccessibilityTest = async (authToken: string) => {
      const riderAccessibility = {
        accessibility: testRiders[0].accessibility,
        description: testRiders[0].description,
      };
      const res = await request(app)
        .get('/api/riders/abc-10/accessibility')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(riderAccessibility);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetRiderAccessibilityTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetRiderAccessibilityTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetRiderAccessibilityTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/riders/abc-10/accessibility')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the addition of a new rider
  describe('Create a new rider', () => {
    const generateCreateNewRiderTest = async (authToken: string) => {
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
        favoriteLocations: ['Test-Location 1'],
        organization: Organization.CULIFT,
        photoLink: '',
        active: true,
      };
      const res = await request(app)
        .post('/api/riders/')
        .send(newRiderData)
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');

      res.status === 200
        ? async () => {
            const sentData = { ...res.body.data };
            delete sentData.id;
            expect(sentData).to.deep.equal(newRiderData);
            const res2 = await request(app)
              .get(`/api/riders/${res.body.data.id}`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            const retrievedData = res2.body.data;
            delete retrievedData.id;
            expect(retrievedData).to.deep.equal(newRiderData);
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateCreateNewRiderTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateCreateNewRiderTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateCreateNewRiderTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).post('/api/riders/').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the updating of info of a rider
  describe('PUT new information for a rider by id abc-10', () => {
    const generateUpdateRiderTest = async (authToken: string) => {
      const res = await request(app)
        .put('/api/riders/abc-10')
        .send({ firstName: 'NewName' })
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      res.status === 200
        ? async () => {
            expect(res.body.data.firstName).to.be.equal('NewName');
            // retrieve rider and see if there is a new name
            const res2 = await request(app)
              .get(`/api/riders/abc-10`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            expect(res2.body.data.firstName).to.be.equal('NewName');
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateUpdateRiderTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateUpdateRiderTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateUpdateRiderTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .put('/api/riders/abc-10')
        .send({ firstName: 'NewName' })
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the deletion of a rider
  const generateDeleteRiderTest = async (authToken: string) => {
    const res = await request(app)
      .delete('/api/riders/abc-10')
      .auth(authToken, { type: 'bearer' })
      .expect('Content-Type', 'application/json; charset=utf-8');
    res.status === 200
      ? async () => {
          expect(res.body).to.deep.equal({ id: 'abc-10' });

          // try to fetch the deleted rider's information; should return 400 error
          const res2 = await request(app)
            .get('/api/riders/abc-10')
            .auth(authToken, { type: 'bearer' })
            .expect(400)
            .expect('content-type', 'application/json; charset=utf-8');
          expect(res2.body).have.property('err');
        }
      : expect(res.status).to.be.equal(400);
  };

  describe('Delete a rider by id abc-10', () => {
    it('should return correct response for Admin account', async () =>
      await generateDeleteRiderTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateDeleteRiderTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateDeleteRiderTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).delete('/api/riders/abc-10').expect(400);
      expect(res.body).have.property('err');
    });
  });
});
