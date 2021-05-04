import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Condition } from 'dynamoose/dist/Condition';
import { Stats, StatsType } from '../models/stats';
import { Ride, RideType, Status } from '../models/ride';
import * as db from './common';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Stats';

router.put('/', validateUser('User'), (req, res) => {
  const { body: { dates } } = req;

  const numEdits = Object.keys(dates).length;

  const statsAcc: StatsType[] = [];

  Object.keys(dates).forEach((date: string) => {
    const year = moment.tz(date as string, 'MM/DD/YYYY', 'America/New_York').format('YYYY');
    const monthDay = moment.tz(date as string, 'MM/DD/YYYY', 'America/New_York').format('MMDD');
    const operation = { $SET: dates[date] };
    const key = { year, monthDay };

    Stats.update(key, operation).then((doc) => {
      statsAcc.push(doc.toJSON() as StatsType);
      checkSend(res, statsAcc, numEdits);
    })
      .catch((err) => res.status(err.statusCode || 500).send({ err: err.message }));
  });
});

router.get('/', validateUser('User'), (req, res) => {
  const { query: { from, to } } = req;

  let date = moment.tz(from, 'America/New_York').format('YYYY-MM-DD');
  const dates = [date];
  if (to) {
    date = moment.tz(date, 'America/New_York').add(1, 'days').format('YYYY-MM-DD');
    while (date <= to) {
      dates.push(date);
      date = moment.tz(date, 'America/New_York').add(1, 'days').format('YYYY-MM-DD');
    }
  }

  const statsAcc: StatsType[] = [];

  dates.forEach((currDate) => {
    const year = moment.tz(currDate, 'YYYY-MM-DD', 'America/New_York').format('YYYY');
    const monthDay = moment.tz(currDate, 'YYYY-MM-DD', 'America/New_York').format('MMDD');

    const dateMoment = moment.tz(currDate, 'America/New_York');
    // day = 12am to 5:00pm
    const dayStart = dateMoment.toISOString();
    const dayEnd = dateMoment.add(17, 'hours').toISOString();
    // night = 5:01pm to 11:59:59pm
    const nightStart = moment.tz(dayEnd, 'America/New_York').add(1, 'seconds').toISOString();
    const nightEnd = moment.tz(currDate as string, 'America/New_York').endOf('day').toISOString();

    computeStats(
      res, statsAcc, dates.length, dayStart, dayEnd, nightStart, nightEnd, year, monthDay,
    );
  });
});

function checkSend(
  res: Response,
  statsAcc: StatsType[],
  numDays: number,
) {
  if (statsAcc.length === numDays) {
    res.send(statsAcc);
  }
}

function computeStats(
  res: Response,
  statsAcc: StatsType[],
  numDays: number,
  dayStart: string,
  dayEnd: string,
  nightStart: string,
  nightEnd: string,
  year: string,
  monthDay: string,
) {
  Stats.get({ year, monthDay }, (err, data) => {
    if (data) {
      statsAcc.push(data.toJSON() as StatsType);
      checkSend(res, statsAcc, numDays);
    } else if (err || !data) {
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
          if (rideData.status === Status.NO_SHOW) {
            if (rideData.startTime <= dayEnd) {
              dayNoShowStat += 1;
            } else {
              nightNoShowStat += 1;
            }
          } else if (rideData.status === Status.COMPLETED) {
            if (rideData.startTime <= dayEnd) {
              dayCountStat += 1;
            } else {
              nightCountStat += 1;
            }
            if (driversStat[driverName]) {
              driversStat[driverName] += 1;
            } else {
              driversStat[driverName] = 1;
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
        Stats.create(stats).then((doc) => {
          statsAcc.push(doc.toJSON() as StatsType);
          checkSend(res, statsAcc, numDays);
        });
      });
    } else {
      console.log('Should be unreachable');
    }
  });
}

export default router;
