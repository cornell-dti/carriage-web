import express, { Response } from 'express';
import moment from 'moment-timezone';
import * as csv from '@fast-csv/format';
import { prisma } from '../db/prisma';
import { RideStatus } from '../../generated/prisma/client';
import { validateUser } from '../util';

const router = express.Router();

type StatsType = {
  year: string;
  monthDay: string;
  dayCount: number;
  dayNoShow: number;
  dayCancel: number;
  nightCount: number;
  nightNoShow: number;
  nightCancel: number;
  drivers: any;
};

router.get('/download', validateUser('Admin'), async (req, res) => {
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

  await statsFromDates(dates, res, true);
});

router.put('/', validateUser('Admin'), async (req, res) => {
  try {
    const { dates } = req.body;

    const updates = Object.keys(dates).map(async (date: string) => {
      const year = moment(date as string, 'MM/DD/YYYY').format('YYYY');
      const monthDay = moment(date as string, 'MM/DD/YYYY').format('MMDD');

      return await prisma.stats.upsert({
        where: { year_monthDay: { year, monthDay } },
        update: dates[date],
        create: {
          year,
          monthDay,
          ...dates[date],
        },
      });
    });

    const statsAcc = await Promise.all(updates);
    res.send(statsAcc);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).send({ err: 'Failed to update stats' });
  }
});

router.get('/', validateUser('Admin'), async (req, res) => {
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
    await statsFromDates(dates, res, false);
  } else {
    res.status(400).send({ err: 'Invalid from/to query date format' });
  }
});

async function statsFromDates(dates: string[], res: Response, download: boolean) {
  const statsAcc: StatsType[] = [];

  for (const currDate of dates) {
    const year = moment(currDate, 'YYYY-MM-DD').format('YYYY');
    const monthDay = moment(currDate, 'YYYY-MM-DD').format('MMDD');

    const dateMoment = moment(currDate);
    const dayStart = dateMoment.toDate();
    const dayEnd = dateMoment.add(17, 'hours').toDate();
    const nightStart = moment(dayEnd).add(1, 'seconds').toDate();
    const nightEnd = moment(currDate as string).endOf('day').toDate();

    await computeStats(
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
  }
}

async function downloadStats(res: Response, statsAcc: StatsType[], numDays: number) {
  if (statsAcc.length === numDays) {
    try {
      const drivers = await prisma.driver.findMany();
      const defaultDrivers = drivers.reduce((acc, curr) => {
        const { firstName, lastName } = curr;
        const fullName = `${firstName} ${lastName}`;
        acc[fullName] = 0;
        return acc;
      }, {} as any);

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

      const csvData = await csv.writeToBuffer(dataToExport, { headers: true });
      res.send(csvData);
    } catch (error) {
      console.error('Error downloading stats:', error);
      res.status(500).send({ err: 'Failed to download stats' });
    }
  }
}

function checkSend(res: Response, statsAcc: StatsType[], numDays: number) {
  if (statsAcc.length === numDays) {
    res.send(statsAcc);
  }
}

async function computeStats(
  res: Response,
  statsAcc: StatsType[],
  numDays: number,
  dayStart: Date,
  dayEnd: Date,
  nightStart: Date,
  nightEnd: Date,
  year: string,
  monthDay: string,
  download: boolean
) {
  try {
    const existingStats = await prisma.stats.findUnique({
      where: { year_monthDay: { year, monthDay } },
    });

    if (existingStats) {
      statsAcc.push(existingStats as StatsType);
      if (!download) {
        checkSend(res, statsAcc, numDays);
      } else {
        await downloadStats(res, statsAcc, numDays);
      }
    } else {
      const rides = await prisma.ride.findMany({
        where: {
          startTime: { gte: dayStart, lte: nightEnd },
        },
        include: { driver: true },
      });

      let dayCountStat = 0;
      let dayNoShowStat = 0;
      let dayCancelStat = 0;
      let nightCountStat = 0;
      let nightNoShowStat = 0;
      let nightCancelStat = 0;
      const driversStat: { [name: string]: number } = {};

      rides.forEach((rideData: any) => {
        const driverName = `${rideData.driver?.firstName} ${rideData.driver?.lastName}`;
        if (rideData.status === RideStatus.NO_SHOW) {
          if (rideData.startTime <= dayEnd) {
            dayNoShowStat += 1;
          } else {
            nightNoShowStat += 1;
          }
        } else if (rideData.status === RideStatus.COMPLETED) {
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
        } else if (rideData.status === RideStatus.CANCELLED) {
          if (rideData.startTime <= dayEnd) {
            dayCancelStat += 1;
          } else {
            nightCancelStat += 1;
          }
        }
      });

      const stats = await prisma.stats.create({
        data: {
          year,
          monthDay,
          dayCount: dayCountStat,
          dayNoShow: dayNoShowStat,
          dayCancel: dayCancelStat,
          nightCount: nightCountStat,
          nightNoShow: nightNoShowStat,
          nightCancel: nightCancelStat,
          drivers: driversStat,
        },
      });

      statsAcc.push(stats as StatsType);
      if (!download) {
        checkSend(res, statsAcc, numDays);
      } else {
        await downloadStats(res, statsAcc, numDays);
      }
    }
  } catch (error) {
    console.error('Error computing stats:', error);
    res.status(500).send({ err: 'Failed to compute stats' });
  }
}

export default router;
