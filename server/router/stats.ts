import express, { Response } from 'express';
import moment from 'moment-timezone';
import { Stats, StatsType } from '../models/stats';
import * as db from './common';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Stats';

router.put('/', validateUser('User'), (req, res) => {
  const { body: { dates } } = req;

  const datesObject = JSON.parse(dates);
  const numEdits = Object.keys(datesObject).length;

  const statsAcc: StatsType[] = [];

  for (const date in datesObject) {
    if (date) {
      const year = moment.tz(date as string, 'MM/DD/YYYY', 'America/New_York').format('YYYY');
      const monthDay = moment.tz(date as string, 'MM/DD/YYYY', 'America/New_York').format('MMDD');
      const operation = { $SET: datesObject[date] };
      const key = { year, monthDay };

      Stats.update(key, operation).then((doc) => {
        statsAcc.push(doc.toJSON() as StatsType);
        checkSend(res, statsAcc, numEdits);
      });
    }
  }
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
