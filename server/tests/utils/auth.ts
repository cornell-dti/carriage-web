import request from 'supertest';
import app from '../../src/app';
import { Admin, Driver, Rider } from '../../src/models';
import { populateDB } from './db';

type Role = 'Admin' | 'Driver' | 'Rider';

const modelFromRole = {
  Admin: Admin,
  Driver: Driver,
  Rider: Rider,
};

const authorize = async (role: Role, data: any | null = {}) => {
  const model = modelFromRole[role];
  const user = await populateDB(model, data);
  const res = await request(app)
    .post('/api/auth/dummy')
    .send({
      table: `${role}s`,
      email: user.email,
    })
    .expect(200);
  return res.body.jwt;
};

export default authorize;
