import app from '../src/app';
import { expect } from 'chai';
import request from 'supertest';

describe('Checking API Health', () => {
  it('returns status 200 and "OK"', (done) => {
    request(app)
      .get('/api/health-check')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .end((err, res) => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.equal('OK');
        done();
      });
  });
});
