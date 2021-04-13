import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as csv from '@fast-csv/format';
import moment from 'moment';
import * as db from './common';
import { Ride, RideLocation, Type } from '../models/ride';
import { Tag } from '../models/location';
import { validateUser } from '../util';
import { DriverType } from '../models/driver';
import { RiderType } from '../models/rider';

const router = express.Router();
const tableName = 'Rides';

router.get('/download', (req, res) => {
  const dateStart = moment(req.query.date as string).toISOString();
  const dateEnd = moment(req.query.date as string).endOf('day').toISOString();
  const condition = new Condition()
    .where('startTime')
    .between(dateStart, dateEnd)
    .where('type')
    .not()
    .eq('unscheduled');

  const callback = (value: any) => {
    const dataToExport = value.map((doc: any) => {
      const start = moment(doc.startTime);
      const end = moment(doc.endTime);
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
  const now = moment().toISOString();
  let condition = new Condition('recurring')
    .eq(true)
    .where('endDate')
    .ge(now.substring(0, 10));
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
      const dateStart = moment(date as string).toISOString();
      const dateEnd = moment(date as string).endOf('day').toISOString();
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
    });
    db.create(res, ride);
  }
});

// Update an existing ride
router.put('/:id', validateUser('User'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Ride, { id }, body, tableName);
});

// Create edit instances and update a repeating ride's edits field
router.put('/:id/edits', (req, res) => {
  const { params: { id }, body: { deleteOnly, origDate, rider, startTime, endTime,
    startLocation, endLocation, driver },
  } = req;

  db.getById(res, Ride, id, tableName, (masterRide) => {
    const origStartTimeOnly = moment(masterRide.startTime).format('HH:mm:ss');
    const origStartTime = moment(`${origDate}T${origStartTimeOnly}`).toISOString();

    const origEndTimeOnly = moment(masterRide.endTime).format('HH:mm:ss');
    const origEndTime = moment(`${origDate}T${origEndTimeOnly}`).toISOString();

    const masterFirstDay = moment(masterRide.startTime).format('YYYY-MM-DD');

    if (origDate === masterFirstDay) {
      // if editing the first instance, move the start/endTimes to the next occurrence
      const weekday = moment(origDate).weekday();
      const weekdayIndex = masterRide.recurringDays.findIndex((day: number) => day === weekday);

      const nextWeekdayIndex = ((weekdayIndex + 1) % masterRide.recurringDays.length);
      const nextWeekday = masterRide.recurringDays[nextWeekdayIndex];

      const addDays = (nextWeekday > weekday) ? nextWeekday - weekday : 7 - weekday + nextWeekday;
      const nextOccurrence = moment(origDate).add(addDays, 'days');

      const newDate = nextOccurrence.format('YYYY-MM-DD');
      const newStartTime = moment(`${newDate}T${origStartTimeOnly}`).toISOString();
      const newEndTime = moment(`${newDate}T${origEndTimeOnly}`).toISOString();

      const setNextOperation = { $SET: { startTime: newStartTime, endTime: newEndTime } };
      db.update(res, Ride, { id }, setNextOperation, tableName);

      // if deleteOnly = false, create a one-time ride with the new fields
      if (!deleteOnly) {
        const newRide = new Ride({
          id: uuid(),
          rider,
          startLocation,
          endLocation,
          startTime,
          endTime,
          driver,
        });
        db.create(res, newRide);
      }
    } else {
      const deleteId = uuid();
      const deleteRide = new Ride({
        id: deleteId,
        rider: masterRide.rider,
        startLocation: masterRide.startLocation,
        endLocation: masterRide.endLocation,
        startTime: origStartTime,
        endTime: origEndTime,
        driver: masterRide.driver,
        deleted: true,
      });
      db.create(res, deleteRide);

      const newEdits = [deleteId];
      if (masterRide.edits) {
        newEdits.concat(masterRide.edits);
      }

      // if deleteOnly = false, create a replace edit with the new fields
      if (!deleteOnly) {
        const replaceId = uuid();
        const replaceRide = new Ride({
          id: replaceId,
          rider,
          startLocation,
          endLocation,
          startTime,
          endTime,
          driver,
          deleted: false,
        });
        db.create(res, replaceRide);
        newEdits.push(replaceId);
      }
      const operation = { $SET: { edits: newEdits } };
      db.update(res, Ride, { id }, operation, tableName);
    }
  });
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Ride, id, tableName);
});

export default router;
