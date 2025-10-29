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
    console.log(from);
    let date = moment(from as string).format('YYYY-MM-DD');
    const dates = [date];
    if (to) {
      console.log(to);
      date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      while (date <= to) {
        dates.push(date);
        date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      }
    }
    console.log('statFromDates called');
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

    console.log('before computeStats');
    const update = true; //REPLACE
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
          .then((data) => {
            res.send(data);
            // console.log(data.toString());
          })
          .catch((err) => res.send(err));
      });
  }
}

function checkSend(res: Response, statsAcc: StatsType[], numDays: number) {
  if (statsAcc.length === numDays) {
    res.send(statsAcc);
  }
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
    console.log('inside Stats.get');
    if (data && !update) {
      statsAcc.push(data.toJSON() as StatsType); //if there is data in stats db, send it
      if (!download) {
        checkSend(res, statsAcc, numDays);
      } else {
        downloadStats(res, statsAcc, numDays);
      }
    } else if (err || !data || update) {
      //else find data from rides
      const conditionRidesDate = new Condition() //retrieve all rides with valid (night or day) start times and is NOT unschedules
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
        console.log('reached db scan');
        console.log('dataDay' + dataDay);
        dataDay.forEach((rideData: RideType) => {
          console.log('rideData' + rideData.status);
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

        if (!update) {
          Stats.create(stats).then((doc) => {
            statsAcc.push(doc.toJSON() as StatsType);
            if (!download) {
              checkSend(res, statsAcc, numDays);
            } else {
              downloadStats(res, statsAcc, numDays);
            }
          });
        } else {
          console.log('update logic here');
          console.log(dayNoShowStat);
          Stats.update(stats).then((doc) => {
            statsAcc.push(doc.toJSON() as StatsType);
            if (!download) {
              checkSend(res, statsAcc, numDays);
            } else {
              downloadStats(res, statsAcc, numDays);
            }
          });
          console.log('finish update');
        }
      });
    } else {
      console.log('Should be unreachable');
    }
  });
}

export default router;
