import request from 'supertest';
import { expect } from 'chai';
import { StatsType } from '../src/models/stats';
import authorize from './utils/auth';
import app from '../src/app';
import moment from 'moment';

type EditStatsType = {
  year?: string;
  monthDay?: string;
  dayCount?: number;
  dayNoShow?: number;
  dayCancel?: number;
  nightCount?: number;
  nightNoShow?: number;
  nightCancel?: number;
  drivers?: {
    [name: string]: number;
  };
};

// Generate 2 random dates formatted "YYYY-MM-DD"
const generate_get_dates = (): [string, string] => {
  const latestDate = moment(); // current date and time
  const earliestDate = moment().subtract(1, 'year'); // one year ago

  const randomDate1 = moment(
    earliestDate.valueOf() +
      Math.random() * (latestDate.valueOf() - earliestDate.valueOf())
  ).format('YYYY-MM-DD');

  const randomDate2 = moment(
    earliestDate.valueOf() +
      Math.random() * (latestDate.valueOf() - earliestDate.valueOf())
  ).format('YYYY-MM-DD');

  let to_date: string;
  let from_date: string;
  if (moment(randomDate1).isAfter(randomDate2)) {
    to_date = randomDate1;
    from_date = randomDate2;
  } else {
    from_date = randomDate1;
    to_date = randomDate2;
  }

  return [from_date, to_date];
};

// Generate Random edit dates and content to update (Arrays are same size)
const generate_edit_dates = (): [[string], [EditStatsType]] => {
  return [['date1'], [{}]];
};

describe('Stats Tests', () => {
  let adminToken: string;
  const [from_date, to_date] = generate_get_dates();

  before(async () => {
    adminToken = await authorize('Admin', {
      firstName: 'Test-Admin',
      lastName: 'Test-Admin',
      phoneNumber: '1111111111',
      email: 'test-admin@cornell.edu',
    });
  });

  describe('GET /api/stats', () => {
    it('Fetch the stats in the range of specified dates', async () => {
      const res = await request(app)
        .get(`/api/stats?from=${from_date}&to=${to_date ? to_date : ''}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      const days =
        moment(to_date as string, 'YYYY-MM-DD').diff(
          moment(from_date as string, 'YYYY-MM-DD'),
          'days'
        ) + 1;
      expect(res.body)
        .to.be.an('array')
        .and.to.have.lengthOf(to_date ? days : 1);
    });
  });

  describe('PUT /api/stats', () => {
    it('Update Specified Dates', async () => {
      
    });
  });
});
