import request from 'supertest';
import { expect } from 'chai';
import authorize from './utils/auth';
import { clearDB } from './utils/db';

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
});
