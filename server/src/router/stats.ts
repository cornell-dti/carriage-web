import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Condition } from 'dynamoose/dist/Condition';
import * as csv from '@fast-csv/format';
import { ObjectType } from 'dynamoose/dist/General';
import { Stats, StatsType } from '../models/stats';
import { Ride, RideType, Status } from '../models/ride';
import * as db from './common';
import { validateUser } from '../util';
import { Driver } from '../models/driver';

const router = express.Router();

/**
 * GET /download
 *
 * protected route for admins that generates & downloads CSV stats
 * for a given date range.
 *
 * query params:
 * - `from` (string): Start date in 'YYYY-MM-DD' format <- required
 * - `to` (string): End date in 'YYYY-MM-DD' format <- optional
 *
 * response:
 * - CSV file containing aggregated ride and driver statistics for date range
 */
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

/**
 * PUT
 *
 * route for admin users to manually edit or update stats entries for
 * multiple dates
 *
 * request body:
 * - `dates` (object): key-value pairs where each key is a date string and the value
 *   is an object with the updated stats fields
 *
 * Example:
 * json
 * {
 *   "dates": {
 *     "01/20/2024": { "dayCount": 5, "nightCount": 7 },
 *     "01/21/2024": { "dayCount": 3, "nightCount": 9 }
 *   }
 * }
 *
 * Response:
 * - JSON array of updated `Stats` objects
 */
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

/**
 * GET
 *
 * protected route for admins to retrieve stats within a date range
 *
 * query params:
 * - `from` (string): Start date in 'YYYY-MM-DD' format <- required
 * - `to` (string): End date in 'YYYY-MM-DD' format <- optional
 *
 * response:
 * - JSON array of computed or existing stats
 */
router.get('/', validateUser('Admin'), (req, res) => {
  console.log('reached stats GET query');
  const {
    query: { from, to },
  } = req;
  const regexp = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  const fromMatch = from ? (from as string).match(regexp) : false;
  const toMatch = to ? (to as string).match(regexp) : true;

  if (fromMatch && toMatch) {
    console.log('from:', from);
    let date = moment(from as string).format('YYYY-MM-DD');
    const dates = [date];
    if (to) {
      console.log('to:', to);
      date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      while (date <= to) {
        dates.push(date);
        date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      }
    }

    console.log('calling statsFromDates with dates:', dates);
    statsFromDates(dates, res, false);
  } else {
    res.status(400).send({ err: 'Invalid from/to query date format' });
  }
});

/**
 * Builds and processes stats for a list of dates.
 * @param {string[]} dates - array of date strings in (YYYY-MM-DD) format
 * @param {Response} res - express response object
 * @param {boolean} download - whether to trigger CSV download (true) or return JSON (false)
 */
function statsFromDates(dates: string[], res: Response, download: boolean) {
  const statsAcc: StatsType[] = [];
  console.log('reached statsFromDates');

  dates.forEach((currDate) => {
    console.log('processing date:', currDate);

    const year = moment(currDate, 'YYYY-MM-DD').format('YYYY');
    const monthDay = moment(currDate, 'YYYY-MM-DD').format('MMDD');

    const dateMoment = moment(currDate);
    const dayStart = dateMoment.toISOString();
    const dayEnd = moment(currDate + 'T16:59:59Z').toISOString();
    const nightStart = moment(currDate + 'T17:00:00Z').toISOString();
    const nightEnd = moment(currDate).endOf('day').toISOString();

    console.log('dayStart:', dayStart);
    console.log('dayEnd:', dayEnd);
    console.log('nightStart:', nightStart);
    console.log('nightEnd:', nightEnd);

    const update = true; // IMPORTANT NOTE!!!! update decides whether you overwrite existing stats in the database or reuse them, 
                         //this was primarily for implementing a 'refresh' button on the stats page so we don't have to parse every ride every time
                         //and an admin can decide when to refresh based off if data has changed

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
      download,
      update
    );
  });
}

/**
 * generates and sends a CSV file containing daily and driver statistics.
 * @param {Response} res - Express response object
 * @param {StatsType[]} statsAcc - array of accumulated stats data
 * @param {number} numDays - number of days requested
 */
function downloadStats(res: Response, statsAcc: StatsType[], numDays: number) {
  if (statsAcc.length === numDays) {
    Driver.scan()
      .exec()
      .then((scanRes) => {
        const defaultDrivers = scanRes.reduce((acc, curr) => {
          const { firstName, lastName } = curr;
          acc[`${firstName} ${lastName}`] = 0;
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
  if (statsAcc.length === numDays) res.send(statsAcc);
}

/**
 * computes stats for a single date. attempts to retrieve existing stats from
 * DynamoDB; if none exist, computes from rides and saves new stats
 *
 * @param {Response} res - Express response object
 * @param {StatsType[]} statsAcc - Accumulator for stats results
 * @param {number} numDays - Total number of requested days
 * @param {string} dayStart - Start timestamp for the day (00:00)
 * @param {string} dayEnd - End timestamp for day period (17:00)
 * @param {string} nightStart - Start timestamp for night period (17:01)
 * @param {string} nightEnd - End timestamp for night period (23:59)
 * @param {string} year - Year string (YYYY)
 * @param {string} monthDay - Month and day string (MMDD)
 * @param {boolean} download - Whether to export as CSV or return JSON
 * @param {boolean} update - Whether to update stats due to changed (or possibly changed) ride data
 */
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
  download: boolean,
  update: boolean
) {
  console.log('just after computeStats');

  Stats.get({ year, monthDay }, (err, data) => {
    console.log('inside Stats.get. existing data:', data);

    if (data && !update) {
      statsAcc.push(data.toJSON() as StatsType);
      return download
        ? downloadStats(res, statsAcc, numDays)
        : checkSend(res, statsAcc, numDays);
    }

    console.log('fetching rides from DB...');

    const conditionRidesDate = new Condition()
      .where('startTime')
      .between(dayStart, nightEnd)
      .where('type')
      .not()
      .eq('unscheduled');

    db.scan(res, Ride, conditionRidesDate, (dataDay: RideType[]) => {
      console.log('reached db scan');
      console.log('dataDay raw:', dataDay);
      console.log(
        'ALL STATUSES:',
        dataDay.map((r) => r.status)
      );

      let dayCountStat = 0;
      let dayNoShowStat = 0;
      let dayCancelStat = 0;
      let nightCountStat = 0;
      let nightNoShowStat = 0;
      let nightCancelStat = 0;
      const driversStat: { [name: string]: number } = {};

      dataDay.forEach((rideData: RideType) => {
        console.log('--- Ride ---');
        console.log('status:', rideData.status);
        console.log('type:', rideData.type);
        console.log('startTime:', rideData.startTime);

        const driverName = `${rideData.driver?.firstName} ${rideData.driver?.lastName}`;

        if (rideData.status === Status.NO_SHOW) {
          rideData.startTime <= dayEnd ? dayNoShowStat++ : nightNoShowStat++;
        } else if (rideData.status === Status.COMPLETED) {
          rideData.startTime <= dayEnd ? dayCountStat++ : nightCountStat++;

          driversStat[driverName] = (driversStat[driverName] || 0) + 1;
        } else if (rideData.status === Status.CANCELLED) {
          rideData.startTime <= dayEnd ? dayCancelStat++ : nightCancelStat++;
        }
      });

      console.log('calculated stats:', {
        dayCountStat,
        dayNoShowStat,
        dayCancelStat,
        nightCountStat,
        nightNoShowStat,
        nightCancelStat,
        driversStat,
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

      if (!update) {
        Stats.create(stats).then((doc) => {
          statsAcc.push(doc.toJSON() as StatsType);
          return download
            ? downloadStats(res, statsAcc, numDays)
            : checkSend(res, statsAcc, numDays);
        });
      } else {
        console.log('update logic here');
        Stats.update(stats).then((doc) => {
          statsAcc.push(doc.toJSON() as StatsType);
          return download
            ? downloadStats(res, statsAcc, numDays)
            : checkSend(res, statsAcc, numDays);
        });
        console.log('finish update');
      }
    });
  });
}

export default router;
