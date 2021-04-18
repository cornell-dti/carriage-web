import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as csv from '@fast-csv/format';
import moment from 'moment-timezone';
import * as db from './common';
import { Ride, RideLocation, Type } from '../models/ride';
import { Tag } from '../models/location';
import { createKeys, validateUser } from '../util';
import { DriverType } from '../models/driver';
import { RiderType } from '../models/rider';

const router = express.Router();
const tableName = 'Rides';

router.get('/download', (req, res) => {
  const dateStart = moment
    .tz(req.query.date as string, 'America/New_York')
    .toISOString();
  const dateEnd = moment
    .tz(req.query.date as string, 'America/New_York')
    .endOf('day')
    .toISOString();
  const condition = new Condition()
    .where('startTime')
    .between(dateStart, dateEnd)
    .where('type')
    .not()
    .eq('unscheduled');

  const callback = (value: any) => {
    const dataToExport = value.map((doc: any) => {
      const start = moment.tz(doc.startTime, 'America/New_York');
      const end = moment.tz(doc.endTime, 'America/New_York');
      const fullName = (user: RiderType | DriverType) => (
        `${user.firstName} ${user.lastName.substring(0, 1)}.`
      );
      return {
        Name: fullName(doc.rider),
        'Pick Up': start.format('h:mm A'),
        From: doc.startLocation.name,
        To: doc.endLocation.name,
        'Drop Off': end.format('h:mm A'),
        Needs: doc.rider.accessibility,
        Driver: fullName(doc.driver),
      };
    });
    csv
      .writeToBuffer(dataToExport, { headers: true })
      .then((data) => res.send(data))
      .catch((err) => res.send(err));
  };
  db.scan(res, Ride, condition, callback);
});

// Get and query all master repeating rides in table
router.get('/repeating', validateUser('User'), (req, res) => {
  const { query: { rider } } = req;
  const now = moment.tz('America/New_York').format('YYYY-MM-DD');
  let condition = new Condition('recurring')
    .eq(true)
    .where('endDate')
    .ge(now);
  if (rider) {
    condition = condition.where('rider').eq(rider);
  }
  db.scan(res, Ride, condition);
});

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName);
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { query } = req;
  if (!Object.keys(query).length) {
    db.getAll(res, Ride, tableName);
  } else {
    const { type, status, rider, driver, date, scheduled } = query;
    let condition = new Condition();
    if (type) {
      condition = condition.where('type').eq(type);
    } else if (scheduled) {
      condition = condition.where('type').not().eq(Type.UNSCHEDULED);
    }
    if (status) {
      condition = condition.where('status').eq(status);
    }
    if (rider) {
      condition = condition.where('rider').eq(rider);
    }
    if (driver) {
      condition = condition.where('driver').eq(driver);
    }
    if (date) {
      const dateStart = moment.tz(date as string, 'America/New_York').toISOString();
      const dateEnd = moment.tz(date as string, 'America/New_York').endOf('day').toISOString();
      condition = condition.where('startTime').between(dateStart, dateEnd);
    }
    db.scan(res, Ride, condition);
  }
});

// Put a ride in Rides table
router.post('/', validateUser('User'), (req, res) => {
  const { body } = req;
  const { startLocation, endLocation, recurring, recurringDays, endDate } = body;

  let startLocationObj: RideLocation | undefined;
  let endLocationObj: RideLocation | undefined;

  if (!validate(startLocation)) {
    const name = startLocation.split(',')[0];
    startLocationObj = {
      name,
      address: startLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (!validate(endLocation)) {
    const name = endLocation.split(',')[0];
    endLocationObj = {
      name,
      address: endLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (recurring && !(recurringDays && endDate)) {
    res.status(400).send({ err: 'Invalid repeating ride.' });
  } else {
    const ride = new Ride({
      ...body,
      id: uuid(),
      startLocation: startLocationObj ?? startLocation,
      endLocation: endLocationObj ?? endLocation,
      edits: recurring ? [] : undefined,
      deleted: recurring ? [] : undefined,
    });
    db.create(res, ride);
  }
});

// Update an existing ride
router.put('/:id', validateUser('User'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Ride, { id }, body, tableName);
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName, (ride) => {
    const { recurring, edits } = ride;
    const deleteRide = () => {
      Ride.delete(id)
        .then(() => res.send({ id }))
        .catch((err) => res.status(500).send({ err: err.message }));
    };
    if (recurring) {
      const ids = createKeys('id', edits);
      Ride.batchDelete(ids)
        .then(deleteRide)
        .catch((err) => res.status(500).send({ err: err.message }));
    } else {
      deleteRide();
    }
  });
});

export default router;
