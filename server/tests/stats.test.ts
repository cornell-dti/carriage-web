import request from 'supertest';
import { expect } from 'chai';
import { StatsType } from '../src/models/stats';
import authorize from './utils/auth';
import app from '../src/app';
import moment from 'moment';
import { clearDB } from './utils/db';

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

//Generate n=1 random dates and corresposnding StatsType Data to be updated
const generate_edit_dates_data = (): StatsType[] => {
  const n = 1; // Adjust parameter for more data values
  const latestDate = moment(); // current date and time
  const earliestDate = moment().subtract(1, 'year'); // one year ago
  const stats: StatsType[] = [];

  for (let i = 0; i < n; i++) {
    const randomDate = moment(
      earliestDate.valueOf() +
        Math.random() * (latestDate.valueOf() - earliestDate.valueOf())
    );
    const dayCount = Math.floor(Math.random() * 100) + 1;
    const dayNoShow = Math.floor(Math.random() * 100) + 1;
    const dayCancel = Math.floor(Math.random() * 100) + 1;
    const nightCount = Math.floor(Math.random() * 100) + 1;
    const nightNoShow = Math.floor(Math.random() * 100) + 1;
    const nightCancel = Math.floor(Math.random() * 100) + 1;

    const stat: StatsType = {
      year: randomDate.format('YYYY'),
      monthDay: randomDate.format('MMDD'),
      dayCount: dayCount,
      dayNoShow: dayNoShow,
      dayCancel: dayCancel,
      nightCount: nightCount,
      nightNoShow: nightNoShow,
      nightCancel: nightCancel,
      drivers: {},
    };

    stats.push(stat);
  }

  return stats;
};

// Formats Stats Type Data to proper request structure
// Currently Assumes stats contains 1 element
const format_edit_dates_request = (stats: StatsType[]) => {
  const updatedStats: StatsType = stats[0];
  const formatDate = `${updatedStats.monthDay.substring(
    0,
    2
  )}/${updatedStats.monthDay.substring(2, 4)}/${updatedStats.year}`;
  return {
    dates: {
      [formatDate]: {
        dayCount: updatedStats.dayCount,
        dayNoShow: updatedStats.dayNoShow,
        dayCancel: updatedStats.dayCancel,
        nightCount: updatedStats.nightCount,
        nightNoShow: updatedStats.nightNoShow,
        nightCancel: updatedStats.nightCancel,
        drivers: updatedStats.drivers,
      },
    },
  };
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
    it('Update Date', async () => {
      const statsData = generate_edit_dates_data();
      const requestBody = format_edit_dates_request(statsData);
      const res = await request(app)
        .put('/api/stats')
        .send(requestBody)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body[0]).to.deep.equal(statsData[0]);
    });
  });

  after(clearDB);

  describe('PUT & GET of same date', () => {
    it('Updates stats at a random Date and GETs Data at that date', async () => {
      const statsData = generate_edit_dates_data();
      // Format Date 'YYYY-MM-DD'; Assume statsData just contains 1 date.
      const from = `${statsData[0].year}-${statsData[0].monthDay.substring(
        0,
        2
      )}-${statsData[0].monthDay.substring(2, 4)}`;
      const to = null;
      const requestBody = format_edit_dates_request(statsData);
      await request(app)
        .put('/api/stats')
        .send(requestBody)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const getRes = await request(app)
        .get(`/api/stats?from=${from}&to=${to ? to : ''}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      expect(getRes.body[0]).to.deep.equal(statsData[0]);
    });
    after(clearDB);
  });
});
