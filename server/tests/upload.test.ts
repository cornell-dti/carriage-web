import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app';
import authorize from './utils/auth';
import { clearDB, populateDB } from './utils/db';

describe('/api/upload tests', () => {
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

  describe('POST /api/upload', () => {
    it('Uploads a new image', async () => {
      
    });
  });
});
