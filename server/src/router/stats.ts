import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Condition } from 'dynamoose/dist/Condition';
import * as csv from '@fast-csv/format';
import { ObjectType } from 'dynamoose/dist/General';
import { Stats, StatsType } from '../models/stats';
import { Ride } from '../models/ride';
import { RideType, Status } from '@carriage-web/shared/src/types/ride';
import * as db from './common';
import { validateUser } from '../util';
import { Driver } from '../models/driver';

const router = express.Router();

router.get('/download', validateUser('Admin'), (req, res) => {
  const {
    query: { from, to },
  } = req;
  let date = moment(from as string).format('YYYY-MM-DD');
  const dates = [date];
  if (to) {
    date = moment(date).add(1, 'days').format('YYYY-MM-DD');
    while (date <= to) {
      dates.push(date);
      date = moment(date).add(1, 'days').format('YYYY-MM-DD');
    }
  }

  statsFromDates(dates, res, true);
});

router.put('/', validateUser('Admin'), (req, res) => {
  const {
    body: { dates },
  } = req;

  const numEdits = Object.keys(dates).length;

  const statsAcc: StatsType[] = [];

  Object.keys(dates).forEach((date: string) => {
    const year = moment(date as string, 'MM/DD/YYYY').format('YYYY');
    const monthDay = moment(date as string, 'MM/DD/YYYY').format('MMDD');
    const operation = { $SET: dates[date] };
    const key = { year, monthDay };

    Stats.update(key, operation)
      .then((doc) => {
        statsAcc.push(doc.toJSON() as StatsType);
        checkSend(res, statsAcc, numEdits);
      })
      .catch((err) =>
        res.status(err.statusCode || 500).send({ err: err.message })
      );
  });
});

router.get('/', validateUser('Admin'), (req, res) => {
  const {
    query: { from, to },
  } = req;
  const regexp = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  const fromMatch = from ? (from as string).match(regexp) : false;
  const toMatch = to ? (to as string).match(regexp) : true;

  if (fromMatch && toMatch) {
    let date = moment(from as string).format('YYYY-MM-DD');
    const dates = [date];
    if (to) {
      date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      while (date <= to) {
        dates.push(date);
        date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      }
    }
    statsFromDates(dates, res, false);
  } else {
    res.status(400).send({ err: 'Invalid from/to query date format' });
  }
});

function statsFromDates(dates: string[], res: Response, download: boolean) {
  const statsAcc: StatsType[] = [];

  dates.forEach((currDate) => {
    const year = moment(currDate, 'YYYY-MM-DD').format('YYYY');
    const monthDay = moment(currDate, 'YYYY-MM-DD').format('MMDD');

    const dateMoment = moment(currDate);
    // day = 12am to 5:00pm
    const dayStart = dateMoment.toISOString();
    const dayEnd = dateMoment.add(17, 'hours').toISOString();
    // night = 5:01pm to 11:59:59pm
    const nightStart = moment(dayEnd).add(1, 'seconds').toISOString();
    const nightEnd = moment(currDate as string)
      .endOf('day')
      .toISOString();

    computeStats(
      res,
      statsAcc,
      dates.length,
      dayStart,
      dayEnd,
      nightStart,
      nightEnd,
      year,
      monthDay,
      download
    );
  });
}

function downloadStats(res: Response, statsAcc: StatsType[], numDays: number) {
  if (statsAcc.length === numDays) {
    Driver.scan()
      .exec()
      .then((scanRes) => {
        const defaultDrivers = scanRes.reduce((acc, curr) => {
          const { firstName, lastName } = curr;
          const fullName = `${firstName} ${lastName}`;
          acc[fullName] = 0;
          return acc;
        }, {} as ObjectType);
        const dataToExport = statsAcc
          .sort(
            (a: any, b: any) =>
              Number(a.year + a.monthDay) - Number(b.year + b.monthDay)
          )
          .map((doc: any) => {
            const { drivers, monthDay } = doc;
            const row = {
              Date: `${monthDay.substring(0, 2)}/${monthDay.substring(2, 4)}/${
                doc.year
              }`,
              'Daily Total': doc.dayCount + doc.nightCount,
              'Daily Ride Count': doc.dayCount,
              'Day No Shows': doc.dayNoShow,
              'Day Cancels': doc.dayCancel,
              'Night Ride Count': doc.nightCount,
              'Night No Shows': doc.nightNoShow,
              'Night Cancels': doc.nightCancel,
              ...defaultDrivers,
              ...drivers,
            };
            return row;
          });
        csv
          .writeToBuffer(dataToExport, { headers: true })
          .then((data) => res.send(data))
          .catch((err) => res.send(err));
      });
  }
}

function checkSend(res: Response, statsAcc: StatsType[], numDays: number) {
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
  download: boolean
) {
  Stats.get({ year, monthDay }, (err, data) => {
    if (data) {
      statsAcc.push(data.toJSON() as StatsType);
      if (!download) {
        checkSend(res, statsAcc, numDays);
      } else {
        downloadStats(res, statsAcc, numDays);
      }
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
        let dayCancelStat = 0;
        let nightCountStat = 0;
        let nightNoShowStat = 0;
        let nightCancelStat = 0;
        const driversStat: { [name: string]: number } = {};

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
          } else if (rideData.status === Status.CANCELLED) {
            if (rideData.startTime <= dayEnd) {
              dayCancelStat += 1;
            } else {
              nightCancelStat += 1;
            }
          }
        });
        const stats = new Stats({
          year,
          monthDay,
          dayCount: dayCountStat,
          dayNoShow: dayNoShowStat,
          dayCancel: dayCancelStat,
          nightCount: nightCountStat,
          nightNoShow: nightNoShowStat,
          nightCancel: nightCancelStat,
          drivers: driversStat,
        });
        Stats.create(stats).then((doc) => {
          statsAcc.push(doc.toJSON() as StatsType);
          if (!download) {
            checkSend(res, statsAcc, numDays);
          } else {
            downloadStats(res, statsAcc, numDays);
          }
        });
      });
    } else {
      console.log('Should be unreachable');
    }
  });
}

export default router;
