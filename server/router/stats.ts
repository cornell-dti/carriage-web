import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Stats, StatsType } from '../models/stats';
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

function checkSend(
  res: Response,
  statsAcc: StatsType[],
  numEdits: number,
) {
  if (statsAcc.length === numEdits) {
    res.send(statsAcc);
  }
}

export default router;
