import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Condition } from 'dynamoose/dist/Condition';
import { Stats } from '../models/stats';
import { Ride, RideType } from '../models/ride';
import * as db from './common';
import { validateUser } from '../util';
import { Driver, DriverType } from '../models/driver';
import { RiderType } from '../models/rider';

const router = express.Router();
const tableName = 'Stats';

router.get('/', validateUser('User'), (req, res) => {
  const { query: { from, to } } = req;

  let date = moment.tz(from, 'America/New_York').format('YYYY-MM-DD');
  let endDate = date;
  const dates = [date];
  if (to) {
    date = moment.tz(date, 'America/New_York').add(1, 'days').format('YYYY-MM-DD');
    endDate = moment.tz(to, 'America/New_York').format('YYYY-MM-DD');
    while (date <= to) {
      dates.push(date);
      date = moment.tz(date, 'America/New_York').add(1, 'days').format('YYYY-MM-DD');
    }
  }
  dates.forEach((currDate) => {
    const year = moment.tz(currDate, 'YYYY-MM-DD', 'America/New_York').format('YYYY');
    const monthDay = moment.tz(currDate, 'YYYY-MM-DD', 'America/New_York').format('MMDD');
    const condition = new Condition()
      .where('year')
      .eq(year)
      .and()
      .where('monthDay')
      .eq(monthDay);

    const dateMoment = moment.tz(currDate, 'America/New_York');
    // day = 12am to 5:00pm
    const dayStart = dateMoment.toISOString();
    const dayEnd = dateMoment.add(17, 'hours').toISOString();
    // night = 5:01pm to 11:59:59pm
    const nightStart = moment.tz(dayEnd, 'America/New_York').add(1, 'seconds').toISOString();
    const nightEnd = moment.tz(currDate as string, 'America/New_York').endOf('day').toISOString();

    computeStats(res, condition, dayStart, dayEnd, nightStart, nightEnd, year,
      monthDay, currDate, endDate);
  });
});

function computeStats(
  res: Response,
  condition: Condition,
  dayStart: string,
  dayEnd: string,
  nightStart: string,
  nightEnd: string,
  year: string,
  monthDay: string,
  date: string,
  endDate: string,
) {
  db.scan(res, Stats, condition, (data: Document[]) => {
    if (data.length) {
      res.write(JSON.stringify(data));
      if (date === endDate) {
        res.end();
      }
    } else {
      const conditionRidesDate = new Condition()
        .where('startTime')
        .between(dayStart, nightEnd)
        .where('type')
        .not()
        .eq('unscheduled');

      db.scan(res, Ride, conditionRidesDate, (dataDay: RideType[]) => {
        let dayCountStat = 0;
        let dayNoShowStat = 0;
        let nightCountStat = 0;
        let nightNoShowStat = 0;
        const driversStat: {[name: string]: number } = {};

        dataDay.forEach((rideData: RideType) => {
          const driverName = `${rideData.driver?.firstName} ${rideData.driver?.lastName}`;
          if (driversStat[driverName]) {
            driversStat[driverName] += 1;
          } else {
            driversStat[driverName] = 1;
          }
          if (rideData.status === 'no_show') {
            if (rideData.startTime <= dayEnd) {
              dayNoShowStat += 1;
            } else {
              nightNoShowStat += 1;
            }
          } else if (rideData.status === 'completed') {
            if (rideData.startTime <= dayEnd) {
              dayCountStat += 1;
            } else {
              nightCountStat += 1;
            }
          }
        });
        const stats = new Stats({
          year,
          monthDay,
          dayCount: dayCountStat,
          dayNoShow: dayNoShowStat,
          dayCancel: 0,
          nightCount: nightCountStat,
          nightNoShow: nightNoShowStat,
          nightCancel: 0,
          drivers: driversStat,
        });
        Stats.create(stats);
        res.write(JSON.stringify(stats));
        if (date === endDate) {
          res.end();
        }
      });
    }
  });
}

export default router;
