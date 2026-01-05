import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { clearDB, populateDB } from './utils/db';
import { Admin } from '../src/models/admin';
import { Driver } from '../src/models/driver';
import { Rider, RiderType } from '../src/models/rider';
import { AdminType } from '../src/models/admin';
import { DriverType } from '../src/models/driver';
import { DayOfWeek } from '../src/models/driver';

const testNetID = `testnetid-${Date.now()}`;
const testEmail = `${testNetID}@cornell.edu`;

const testAdmin: Omit<AdminType, 'id'> = {
    firstName: 'Test',
    lastName: 'Admin',
    phoneNumber: '1234567890',
    email: testEmail,
    type: ['sds-admin'],
    isDriver: false,
};

const testDriver: Omit<DriverType, 'id'> = {
    firstName: 'Test',
    lastName: 'Driver',
    phoneNumber: '0987654321',
    email: `driver-${Date.now()}@cornell.edu`,
    availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
    active: true,
};

const testRider: Omit<RiderType, 'id'> = {
    firstName: 'Test',
    lastName: 'Rider',
    phoneNumber: '5555555555',
    email: `rider-${Date.now()}@cornell.edu`,
    joinDate: '2024-01-01',
    endDate: '2024-12-31',
    address: '123 Main St, Ithaca, NY 14850',
    favoriteLocations: [],
    active: true,
};

describe('NetID Duplicate Prevention Tests', () => {
    let adminToken: string;
    let createdAdminId: string;
    let createdDriverId: string;
    let createdRiderId: string;

    before(async () => {
        // Create an admin user for authorization
        adminToken = await authorize('Admin', {
            firstName: 'Auth',
            lastName: 'Admin',
            phoneNumber: '1111111111',
            email: `auth-admin-${Date.now()}@cornell.edu`,
            type: ['sds-admin'],
            isDriver: false,
        });
    });

    after(clearDB);

    describe('POST /api/admins - Prevent duplicate NetID on creation', () => {
        it('should successfully create an admin with unique NetID', async () => {
            const uniqueEmail = `admin-${Date.now()}@cornell.edu`;
            const res = await request(app)
                .post('/api/admins')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: uniqueEmail,
                    phoneNumber: '1234567890',
                    type: ['sds-admin'],
                    isDriver: false,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('data');
            createdAdminId = res.body.data.id;
        });

        it('should reject creating admin with duplicate NetID (same table)', async () => {
            const driverEmail = `driver-${Date.now()}@cornell.edu`;
            const driverRes = await request(app)
                .post('/api/drivers')
                .send({
                    firstName: 'Driver',
                    lastName: 'Test',
                    email: driverEmail,
                    phoneNumber: '1111111111',
                    availability: ['MON'],
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            createdDriverId = driverRes.body.data.id;

            // Try to create admin with same email
            const res = await request(app)
                .post('/api/admins')
                .send({
                    firstName: 'Admin',
                    lastName: 'Test',
                    email: driverEmail,
                    phoneNumber: '2222222222',
                    type: ['sds-admin'],
                    isDriver: false,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });

        it('should reject creating admin with NetID that exists in Riders table', async () => {
            // First create a rider
            const riderEmail = `rider-${Date.now()}@cornell.edu`;
            const riderRes = await request(app)
                .post('/api/riders')
                .send({
                    firstName: 'Rider',
                    lastName: 'Test',
                    email: riderEmail,
                    phoneNumber: '3333333333',
                    joinDate: '2024-01-01',
                    endDate: '2024-12-31',
                    address: '123 Main St, Ithaca, NY 14850',
                    active: true,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(201);
            createdRiderId = riderRes.body.id;

            // Try to create admin with same email
            const res = await request(app)
                .post('/api/admins')
                .send({
                    firstName: 'Admin',
                    lastName: 'Test',
                    email: riderEmail,
                    phoneNumber: '4444444444',
                    type: ['sds-admin'],
                    isDriver: false,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });

    describe('POST /api/drivers - Prevent duplicate NetID on creation', () => {
        it('should successfully create a driver with unique NetID', async () => {
            const uniqueEmail = `driver-unique-${Date.now()}@cornell.edu`;
            const res = await request(app)
                .post('/api/drivers')
                .send({
                    firstName: 'Driver',
                    lastName: 'Unique',
                    email: uniqueEmail,
                    phoneNumber: '5555555555',
                    availability: ['MON', 'TUE'],
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('data');
        });

        it('should reject creating driver with duplicate NetID', async () => {
            const duplicateEmail = `duplicate-${Date.now()}@cornell.edu`;

            // Create first driver
            await request(app)
                .post('/api/drivers')
                .send({
                    firstName: 'First',
                    lastName: 'Driver',
                    email: duplicateEmail,
                    phoneNumber: '1111111111',
                    availability: ['MON'],
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            // Try to create second driver with same NetID
            const res = await request(app)
                .post('/api/drivers')
                .send({
                    firstName: 'Second',
                    lastName: 'Driver',
                    email: duplicateEmail,
                    phoneNumber: '2222222222',
                    availability: ['TUE'],
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });

    describe('POST /api/riders - Prevent duplicate NetID on creation', () => {
        it('should successfully create a rider with unique NetID', async () => {
            const uniqueEmail = `rider-unique-${Date.now()}@cornell.edu`;
            const res = await request(app)
                .post('/api/riders')
                .send({
                    firstName: 'Rider',
                    lastName: 'Unique',
                    email: uniqueEmail,
                    phoneNumber: '6666666666',
                    joinDate: '2024-01-01',
                    endDate: '2024-12-31',
                    address: '123 Main St, Ithaca, NY 14850',
                    active: true,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(201);

            expect(res.body).to.have.property('id');
        });

        it('should reject creating rider with duplicate NetID', async () => {
            const duplicateEmail = `rider-duplicate-${Date.now()}@cornell.edu`;

            // Create first rider
            await request(app)
                .post('/api/riders')
                .send({
                    firstName: 'First',
                    lastName: 'Rider',
                    email: duplicateEmail,
                    phoneNumber: '7777777777',
                    joinDate: '2024-01-01',
                    endDate: '2024-12-31',
                    address: '123 Main St, Ithaca, NY 14850',
                    active: true,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(201);

            // Try to create second rider with same NetID
            const res = await request(app)
                .post('/api/riders')
                .send({
                    firstName: 'Second',
                    lastName: 'Rider',
                    email: duplicateEmail,
                    phoneNumber: '8888888888',
                    joinDate: '2024-01-01',
                    endDate: '2024-12-31',
                    address: '456 Main St, Ithaca, NY 14850',
                    active: true,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });

    describe('PUT /api/admins/:id - Prevent duplicate NetID on update', () => {
        let testAdminId: string;
        let otherAdminId: string;

        before(async () => {
            // Create two admins for testing
            const admin1 = await populateDB(Admin, {
                firstName: 'Admin1',
                lastName: 'Test',
                phoneNumber: '1111111111',
                email: `admin1-${Date.now()}@cornell.edu`,
                type: ['sds-admin'],
                isDriver: false,
            });
            testAdminId = admin1.id;

            const admin2 = await populateDB(Admin, {
                firstName: 'Admin2',
                lastName: 'Test',
                phoneNumber: '2222222222',
                email: `admin2-${Date.now()}@cornell.edu`,
                type: ['sds-admin'],
                isDriver: false,
            });
            otherAdminId = admin2.id;
        });

        it('should allow updating admin with same NetID (keeping own NetID)', async () => {
            const res = await request(app)
                .put(`/api/admins/${testAdminId}`)
                .send({
                    firstName: 'Updated',
                    email: `admin1-${Date.now()}@cornell.edu`, // Different email but should work
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('data');
        });

        it('should reject updating admin to NetID that belongs to another admin', async () => {
            // Get the other admin's email
            const otherAdminRes = await request(app)
                .get(`/api/admins/${otherAdminId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const otherAdminEmail = otherAdminRes.body.data.email;

            // Try to update test admin to use other admin's email
            const res = await request(app)
                .put(`/api/admins/${testAdminId}`)
                .send({
                    email: otherAdminEmail,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });

        it('should reject updating admin to NetID that belongs to a driver', async () => {
            // Get the driver's email
            const driverRes = await request(app)
                .get(`/api/drivers/${createdDriverId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const driverEmail = driverRes.body.data.email;

            // Try to update admin to use driver's email
            const res = await request(app)
                .put(`/api/admins/${testAdminId}`)
                .send({
                    email: driverEmail,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });

    describe('PUT /api/drivers/:id - Prevent duplicate NetID on update', () => {
        let testDriverId: string;
        let otherDriverId: string;

        before(async () => {
            // Create two drivers for testing
            const driver1 = await populateDB(Driver, {
                firstName: 'Driver1',
                lastName: 'Test',
                phoneNumber: '1111111111',
                email: `driver1-${Date.now()}@cornell.edu`,
                availability: ['MON'],
                active: true,
            });
            testDriverId = driver1.id;

            const driver2 = await populateDB(Driver, {
                firstName: 'Driver2',
                lastName: 'Test',
                phoneNumber: '2222222222',
                email: `driver2-${Date.now()}@cornell.edu`,
                availability: ['TUE'],
                active: true,
            });
            otherDriverId = driver2.id;
        });

        it('should allow updating driver with same NetID (keeping own NetID)', async () => {
            const res = await request(app)
                .put(`/api/drivers/${testDriverId}`)
                .send({
                    firstName: 'Updated',
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('data');
        });

        it('should reject updating driver to NetID that belongs to another driver', async () => {
            // Get the other driver's email
            const otherDriverRes = await request(app)
                .get(`/api/drivers/${otherDriverId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const otherDriverEmail = otherDriverRes.body.data.email;

            // Try to update test driver to use other driver's email
            const res = await request(app)
                .put(`/api/drivers/${testDriverId}`)
                .send({
                    email: otherDriverEmail,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });

    describe('PUT /api/riders/:id - Prevent duplicate NetID on update', () => {
        let testRiderId: string;
        let otherRiderId: string;

        before(async () => {
            // Create two riders for testing
            const rider1 = await populateDB(Rider, {
                firstName: 'Rider1',
                lastName: 'Test',
                phoneNumber: '1111111111',
                email: `rider1-${Date.now()}@cornell.edu`,
                joinDate: '2024-01-01',
                endDate: '2024-12-31',
                address: '123 Main St, Ithaca, NY 14850',
                active: true,
            });
            testRiderId = rider1.id;

            const rider2 = await populateDB(Rider, {
                firstName: 'Rider2',
                lastName: 'Test',
                phoneNumber: '2222222222',
                email: `rider2-${Date.now()}@cornell.edu`,
                joinDate: '2024-01-01',
                endDate: '2024-12-31',
                address: '456 Main St, Ithaca, NY 14850',
                active: true,
            });
            otherRiderId = rider2.id;
        });

        it('should allow updating rider with same NetID (keeping own NetID)', async () => {
            const res = await request(app)
                .put(`/api/riders/${testRiderId}`)
                .send({
                    firstName: 'Updated',
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body).to.have.property('data');
        });

        it('should reject updating rider to NetID that belongs to another rider', async () => {
            // Get the other rider's email
            const otherRiderRes = await request(app)
                .get(`/api/riders/${otherRiderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const otherRiderEmail = otherRiderRes.body.data.email;

            // Try to update test rider to use other rider's email
            const res = await request(app)
                .put(`/api/riders/${testRiderId}`)
                .send({
                    email: otherRiderEmail,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });

        it('should reject updating rider to NetID that belongs to an admin', async () => {
            // Get an admin's email
            const adminRes = await request(app)
                .get(`/api/admins/${createdAdminId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            const adminEmail = adminRes.body.data.email;

            // Try to update rider to use admin's email
            const res = await request(app)
                .put(`/api/riders/${testRiderId}`)
                .send({
                    email: adminEmail,
                })
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(409);

            expect(res.body.err).to.include('NetID');
        });
    });
});