import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { clearDB, populateDB } from './utils/db';
import { Admin } from '../src/models';

//Testing Data
// Basic Data: Appropriate Admin
const AdminRequest1 = {
  firstName: 'Endpoint-Test',
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
};

//Admin with Fixed ID
const AdminFixedID = {
  firstName: 'Endpoint-Test-Fixed-ID',
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
  id: 1,
};

//Admin with Missing Data
const AdminMissingData = {
  lastName: 'Admin',
  phoneNumber: '0000000000',
  email: 'adminEndpointTest@example.com',
  photoLink: 'random-link',
};

// Test with invalid email input
const AdminInvalidEmail = {
  ...AdminRequest1,
  email: 'invalid-email',
};

describe('Admin Tests', () => {
  let adminToken: string;
  let globalAdminID: string;
  const wrongID = 'wrong';

  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
  });

  after(clearDB);

  describe('POST /api/admins/', () => {
    it('Create a new admin : success', async () => {
      const postAdmin = await request(app)
        .post('/api/admins')
        .send(AdminRequest1)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      globalAdminID = postAdmin.body['data']['id'];
      expect(postAdmin.body.data).to.have.property('id');
    });

    it('Create a new admin with fixed ID : success but ID should be UUID not Fixed', async () => {
      const postAdminFixedID = await request(app)
        .post('/api/admins')
        .send(AdminFixedID)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(postAdminFixedID.body.data['id']).not.equal(AdminFixedID['id']);
    });

    it('Create a new admin : fail with missing required data', async () => {
      const postAdminMissingData = await request(app)
        .post('/api/admins')
        .send(AdminMissingData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);

      expect(postAdminMissingData.body).to.have.property('err');
    });

    it('Create a new admin : fail with invalid email input', async () => {
      const postAdminInvalidEmail = await request(app)
        .post('/api/admins')
        .send(AdminInvalidEmail)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500); //should be a 400 Bad request but server side data validation is not handled properly
      expect(postAdminInvalidEmail.body).to.have.property('err');
    });
  });

  describe('PUT /api/admins/:id', () => {
    it('Update an existing admin : success', async () => {
      const adminToUpdate = {
        ...AdminRequest1,
        firstName: 'Test-Update-Admin',
      };

      const putAdmin = await request(app)
        .put(`/api/admins/${globalAdminID}`)
        .send(adminToUpdate)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(putAdmin.body.data).to.include(adminToUpdate);
    });

    it('Update a non-existing admin : fail with Non-Existent admin', async () => {
      const adminToUpdate = { ...AdminRequest1, firstName: 'Updated-Admin' };

      const putAdminFail = await request(app)
        .put(`/api/admins/${wrongID}`)
        .send(adminToUpdate)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(putAdminFail.body).to.have.property('err');
    });

    // Test with invalid email input for PUT request
    it('Update an existing admin : fail with invalid email input', async () => {
      const adminToUpdateInvalidEmail = {
        ...AdminRequest1,
        email: 'invalid-email',
      };

      const putAdminInvalidEmail = await request(app)
        .put(`/api/admins/${globalAdminID}`)
        .send(adminToUpdateInvalidEmail)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500); //should be a 400 Bad request but server side data validation is not handled properly

      expect(putAdminInvalidEmail.body).to.have.property('err');
    });
  });

  describe('GET /api/admins/:id', () => {
    it('Retrieve a specific admin : success', async () => {
      const getAdmin = await request(app)
        .get(`/api/admins/${globalAdminID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(getAdmin.body.data).to.have.property('id');
      expect(getAdmin.body.data.id).to.equal(globalAdminID);
    });

    it('Retrieve a specific admin : fail with Non-Existent Admin', async () => {
      const getAdminWrongID = await request(app)
        .get(`/api/admins/${wrongID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(getAdminWrongID.body).to.have.property('err');
    });
  });

  describe('GET /api/admins/', () => {
    it('Retrieve all admins : success', async () => {
      const getAllAdmin = await request(app)
        .get('/api/admins/')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      const storedAdmins = await Admin.scan().exec();
      expect(getAllAdmin.body.data).to.deep.equal(
        storedAdmins.map((admin: { toJSON: () => any }) => admin.toJSON())
      );
    });

    // Test unauthorized access (without token)
    it('Retrieve all admins : fail with unauthorized access (without token)', async () => {
      const getAllAdminUnauthorized = await request(app)
        .get('/api/admins/')
        .expect(400);

      expect(getAllAdminUnauthorized.body).to.have.property('err');
    });
  });

  describe('DELETE /api/admins/:id', () => {
    it('Delete a specific admin : success', async () => {
      const deleteAdmin = await request(app)
        .delete(`/api/admins/${globalAdminID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const getDeletedAdmin = await request(app)
        .get(`/api/admins/${globalAdminID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(getDeletedAdmin.body).to.have.property('err');
    });

    it('Delete a specific admin : fail with Non-Existent ID', async () => {
      const deleteAdminWrongID = await request(app)
        .delete(`/api/admins/${wrongID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(deleteAdminWrongID.body).to.have.property('err');
    });
  });
});
