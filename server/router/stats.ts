import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Condition } from 'dynamoose/dist/Condition';
import { Stats } from '../models/stats';
import { Ride } from '../models/ride';
import * as db from './common';
import { validateUser } from '../util';
import { Driver, DriverType } from '../models/driver';

const router = express.Router();
const tableName = 'Stats';

router.get('/:from/:to', validateUser('User'), async (req, res) => {
  const { params: { from, to } } = req;

  let date = from;
  const dates = [];
  while (date <= to) {
    dates.push(date);
    date = moment.tz(date, 'America/New_York').add(1, 'days').format('YYYY-MM-DD');
  }

  dates.forEach(async (currDate) => {
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
      monthDay, currDate, to);
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
  to: string,
) {
  db.scan(res, Stats, condition, async (data: Document[]) => {
    if (data.length) {
      res.write(JSON.stringify(data));
      if (date === to) {
        res.end();
      }
    } else {
      const conditionRidesDay = new Condition()
        .where('startTime')
        .between(dayStart, dayEnd)
        .where('type')
        .not()
        .eq('unscheduled')
        .where('status')
        .eq('completed');

      const conditionRidesDayNoShow = new Condition()
        .where('startTime')
        .between(dayStart, dayEnd)
        .where('type')
        .not()
        .eq('unscheduled')
        .where('status')
        .eq('no_show');

      const conditionRidesNight = new Condition()
        .where('startTime')
        .between(nightStart, nightEnd)
        .where('type')
        .not()
        .eq('unscheduled')
        .where('status')
        .eq('completed');

      const conditionRidesNightNoShow = new Condition()
        .where('startTime')
        .between(nightStart, nightEnd)
        .where('type')
        .not()
        .eq('unscheduled')
        .where('status')
        .eq('no_show');

      db.scan(res, Ride, conditionRidesDay, ((dataDay: Document[]) => {
        const dayCountStat = dataDay.length;

        db.scan(res, Ride, conditionRidesDayNoShow, ((dataDayNoShow: Document[]) => {
          const dayNoShowStat = dataDayNoShow.length;

          db.scan(res, Ride, conditionRidesNight, ((dataNight: Document[]) => {
            const nightCountStat = dataNight.length;

            db.scan(res, Ride, conditionRidesNightNoShow, ((dataNightNoShow: Document[]) => {
              const nightNoShowStat = dataNightNoShow.length;

              const driversStat: {[name: string]: number } = {};
              db.getAll(res, Driver, 'Drivers', async (driversData) => {
                driversData.forEach((driverData: DriverType) => {
                  const driverName = `${driverData.firstName} ${driverData.lastName}`;
                  const conditionRidesDriver = new Condition()
                    .where('startTime')
                    .between(dayStart, nightEnd)
                    .where('type')
                    .not()
                    .eq('unscheduled')
                    .where('driver')
                    .eq(driverData);

                  db.scan(res, Ride, conditionRidesDriver, (dataDriver: Document[]) => {
                    driversStat[driverName] = dataDriver.length;
                  });
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
                if (date === to) {
                  res.end();
                }
              });
            }));
          }));
        }));
      }));
    }
  });
}

export default router;
