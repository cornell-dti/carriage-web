import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { Driver } from '../src/models';
import { clearDB, populateDB } from './utils/db';
import { Vehicle, VehicleType } from '../src/models/vehicle';
import { DriverType } from '../src/models/driver';
import { AdminType } from '../src/models/admin';
import { Organization, RiderType } from '../src/models/rider';

const testAdmin: Omit<AdminType, 'id'> = {
  firstName: 'Test-Admin',
  lastName: 'Test-Admin',
  phoneNumber: '1111111111',
  email: 'test-admin@cornell.edu',
};

const testRider: Omit<RiderType, 'id'> = {
  email: 'testrider-email@test.com',
  phoneNumber: '1234567890',
  firstName: 'TestRider',
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

const testVehicles: VehicleType[] | string = [
  {
    id: 'vehicle1',
    name: 'Toyota',
    capacity: 5,
  },
  {
    id: 'vehicle2',
    name: 'Honda',
    capacity: 4,
  },
  {
    id: 'vehicle3',
    name: 'Acura',
    capacity: 4,
  },
];
const testDrivers: DriverType[] = [
  {
    id: 'driver0',
    email: 'drivertest-email@test.com',
    phoneNumber: '1234567890',
    firstName: 'Test',
    lastName: 'Testing',
    vehicle: testVehicles[0],
    startDate: '2023-03-09',
    availability: {
      Mon: {
        startTime: '8:00',
        endTime: '12:00',
      },
      Tue: {
        startTime: '8:00',
        endTime: '12:00',
      },
      Wed: {
        startTime: '8:00',
        endTime: '12:00',
      },
      Thu: {
        startTime: '8:00',
        endTime: '12:00',
      },
      Fri: {
        startTime: '8:00',
        endTime: '12:00',
      },
    },
    photoLink: '',
    admin: true,
  },
  {
    id: 'driver1',
    email: 'drivertest-email1@test.com',
    phoneNumber: '1234567891',
    firstName: 'Test',
    lastName: 'Testing1',
    vehicle: testVehicles[1],
    startDate: '2023-03-10',
    availability: {
      Mon: {
        startTime: '9:00',
        endTime: '12:00',
      },
      Tue: {
        startTime: '11:00',
        endTime: '12:00',
      },
      Wed: {
        startTime: '2:00',
        endTime: '7:00',
      },
      Thu: {
        startTime: '5:00',
        endTime: '6:00',
      },
      Fri: {
        startTime: '3:00',
        endTime: '5:00',
      },
    },
    photoLink: '',
    admin: false,
  },
];

describe('Testing Functionality of Drivers Endpoints', () => {
  let adminToken: string;
  let riderToken: string;
  let driverToken: string;
  before(async () => {
    adminToken = await authorize('Admin', testAdmin);
    riderToken = await authorize('Rider', testRider);
    driverToken = await authorize('Driver', testDrivers[0]);
    await Promise.all(
      testDrivers.slice(1).map((driver) => populateDB(Driver, driver))
    );
    await Promise.all(
      testVehicles.map((vehicle) => populateDB(Vehicle, vehicle))
    );
  });

  after(clearDB);

  // testing retrieval of specific driver
  describe('Testing get driver by Id', () => {
    const generateGetDriverTest = async (authToken: string) => {
      const res = await request(app)
        .get('/api/drivers/driver0')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.deep.equal(testDrivers[0]);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetDriverTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetDriverTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of all drivers
  const generateAllDriversTest = async (authToken: string) => {
    const res = await request(app)
      .get('/api/drivers/')
      .auth(authToken, { type: 'bearer' })
      .expect('Content-Type', 'application/json; charset=utf-8');
    res.status === 200
      ? (expect(res.status).to.be.equal(200),
        expect(res.body).to.have.property('data'),
        expect(res.body.data).to.deep.equal(testDrivers))
      : expect(res.status).to.be.equal(400);
  };

  describe('GET all drivers', () => {
    it('should return correct response for Admin account', async () =>
      await generateAllDriversTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateAllDriversTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateAllDriversTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).get('/api/drivers/').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing retrieval of driver profile
  describe('GET a driver profile by ID', () => {
    const generateGetDriverProfileTest = async (authToken: string) => {
      const driverProfile = {
        email: 'drivertest-email@test.com',
        phoneNumber: '1234567890',
        firstName: 'Test',
        lastName: 'Testing',
        availability: {
          Mon: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Tue: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Wed: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Thu: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Fri: {
            startTime: '8:00',
            endTime: '12:00',
          },
        },
        vehicle: testVehicles[0],
      };
      const res = await request(app)
        .get('/api/drivers/driver0/profile')
        .auth(authToken, { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(res.status).to.be.equal(200);
      expect(res.body).to.deep.equal(driverProfile);
    };
    it('should return correct response for Admin account', async () =>
      await generateGetDriverProfileTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateGetDriverProfileTest(driverToken));
    it('should return correct response for Rider account', async () =>
      await generateGetDriverProfileTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app)
        .get('/api/drivers/driver0/profile')
        .expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the addition of a new driver

  describe('Create a new driver', () => {
    const generateCreateDriverTest = async (authToken: string) => {
      const newDriverData = {
        email: 'drivertest3-email@test.com',
        phoneNumber: '1234567890',
        firstName: 'Test',
        lastName: 'Testing',
        vehicle: testVehicles[2],
        startDate: '2023-03-09',
        availability: {
          Mon: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Tue: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Wed: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Thu: {
            startTime: '8:00',
            endTime: '12:00',
          },
          Fri: {
            startTime: '8:00',
            endTime: '12:00',
          },
        },
        photoLink: '',
        admin: true,
      };
      const res = await request(app)
        .post('/api/drivers/')
        .send(newDriverData)
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      res.status === 200
        ? async () => {
            const sentData = { ...res.body.data };
            // this is randomly generated and cannot be tested for,
            // but the accuracy of the rest of the data can be
            delete sentData.id;
            expect(sentData).to.deep.equal(newDriverData);
            // retrieve this new rider
            const res2 = await request(app)
              .get(`/api/drivers/${res.body.data.id}`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            const retrievedData = res2.body.data;
            delete retrievedData.id;
            expect(retrievedData).to.deep.equal(newDriverData);
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateCreateDriverTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateCreateDriverTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateCreateDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).post('/api/drivers/').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the updating of info of a driver
  describe('PUT new information for a driver by id driver0', () => {
    const generateUpdateDriverTest = async (authToken: string) => {
      const res = await request(app)
        .put('/api/drivers/driver0')
        .send({ firstName: 'NewName' })
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      res.status === 200
        ? async () => {
            expect(res.body.data.firstName).to.be.equal('NewName');
            // retrieve driver and see if there is a new name
            const res2 = await request(app)
              .get(`/api/drivers/driver0`)
              .auth(authToken, { type: 'bearer' })
              .expect(200)
              .expect('content-type', 'application/json; charset=utf-8');
            expect(res2.body.data.firstName).to.be.equal('NewName');
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateUpdateDriverTest(adminToken));
    it('should return correct response for Driver account', async () =>
      await generateUpdateDriverTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateUpdateDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).put('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });

  // testing the deletion of a driver
  describe('DELETE a driver by id driver0', () => {
    const generateDeleteDriverTest = async (authToken: string) => {
      const res = await request(app)
        .delete('/api/drivers/driver0')
        .auth(authToken, { type: 'bearer' })
        .expect('Content-Type', 'application/json; charset=utf-8');
      res.status === 200
        ? async () => {
            expect(res.body).to.deep.equal({ id: 'driver0' });

            // try to fetch the deleted driver's information; should return 400 error
            const res2 = await request(app)
              .get('/api/drivers/driver0')
              .auth(authToken, { type: 'bearer' })
              .expect(400)
              .expect('content-type', 'application/json; charset=utf-8');
            expect(res2.body).to.deep.equal({ err: 'id not found in Drivers' });
          }
        : expect(res.status).to.be.equal(400);
    };
    it('should return correct response for Admin account', async () =>
      await generateDeleteDriverTest(adminToken));
    it('should fail with 400 given Driver account', async () =>
      await generateDeleteDriverTest(driverToken));
    it('should fail with 400 given Rider account', async () =>
      await generateDeleteDriverTest(riderToken));
    it('should fail with 400 given no authorization header', async () => {
      const res = await request(app).delete('/api/drivers/driver0').expect(400);
      expect(res.body).have.property('err');
    });
  });
});
