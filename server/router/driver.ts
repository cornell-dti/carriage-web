import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import moment from 'moment-timezone';
import * as db from './common';
import { Driver, DriverType } from '../models/driver';
import { validateUser } from '../util';
import { Ride, Status } from '../models/ride';
import { UserType } from '../models/subscription';

const router = express.Router();
const tableName = 'Drivers';

// Get a driver by id in Drivers table
router.get('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Driver, id, tableName);
});

// Get all drivers
router.get('/', validateUser('Admin'), (req, res) => {
  db.getAll(res, Driver, tableName);
});

// Get profile information for a driver
router.get('/:id/profile', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Driver, id, tableName, (driver: DriverType) => {
    const { email, firstName, lastName, phoneNumber, availability, vehicle } =
      driver;
    res.send({
      email,
      firstName,
      lastName,
      phoneNumber,
      availability,
      vehicle,
    });
  });
});

// Get all available drivers at a given time
router.get('/available', validateUser('Admin'), (req, res) => {
  const {date, startTime, endTime} = req.query;
  const reqStart = moment(date as string + " " + startTime as string);
  const reqEnd = moment(date as string + " " + endTime as string);
  
});

// Get whether a driver is available at a given time
// startTime and endTime must be in the format YYYY-MM-DDTHH:MM
router.get('/:id/:startTime/:endTime', (req, res) => {
  const {
    params: { id, startTime, endTime },
  } = req;

  const reqStart = moment(startTime);
  const reqEnd = moment(endTime);

  if (reqStart.date() !== reqEnd.date()) {
    res.status(400).send({ err: 'startTime and endTime dates must be equal' });
  }

  const reqStartTime = reqStart.format('HH:mm');
  const reqEndTime = reqEnd.format('HH:mm');

  if (reqStartTime > reqEndTime) {
    res.status(400).send({ err: 'startTime must precede endTime' });
  }

  const reqStartDay = moment(startTime).day();
  const reqEndDay = moment(endTime).day();

  let available = false;

  db.getById(res, Driver, id, tableName, (driver) => {
    const { availability } = driver as DriverType;
    const availStart = (() => {
      if (reqStartDay === 1) return availability.Mon?.startTime;
      if (reqStartDay === 2) return availability.Tue?.startTime;
      if (reqStartDay === 3) return availability.Wed?.startTime;
      if (reqStartDay === 4) return availability.Thu?.startTime;
      if (reqStartDay === 5) return availability.Fri?.startTime;
      return null;
    })();

    const availStartTime = moment(availStart as string, 'HH:mm').format(
      'HH:mm'
    );

    if (availStart != null && availStartTime <= reqStartTime) {
      const availEnd = (() => {
        if (reqEndDay === 1) return availability.Mon?.endTime;
        if (reqEndDay === 2) return availability.Tue?.endTime;
        if (reqEndDay === 3) return availability.Wed?.endTime;
        if (reqEndDay === 4) return availability.Thu?.endTime;
        if (reqEndDay === 5) return availability.Fri?.endTime;
        return null;
      })();

      const availEndTime = moment(availEnd as string, 'HH:mm').format('HH:mm');

      if (availEnd != null && availEndTime >= reqEndTime) {
        available = true;
      }
    }
    res.status(200).send(available);
  });
});

// Get a driver's weekly stats
router.get('/:id/stats', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  const week = moment().subtract(1, 'week');
  const weekStart = week.startOf('week').toISOString();
  const weekEnd = week.endOf('week').toISOString();
  const condition = new Condition('startTime')
    .ge(weekStart)
    .where('endTime')
    .le(weekEnd)
    .where('driver')
    .eq(id)
    .where('status')
    .eq(Status.COMPLETED);

  const calculateHoursWorked = (driver: DriverType) =>
    Object.values(driver.availability).reduce((acc, curr) => {
      const { startTime, endTime } = curr!;
      const hours = moment
        .duration(endTime)
        .subtract(moment.duration(startTime))
        .asHours();
      return acc + hours;
    }, 0);

  db.getById(res, Driver, id, tableName, (driver) => {
    db.scan(res, Ride, condition, (data: Document[]) => {
      res.send({
        rides: data.length,
        workingHours: calculateHoursWorked(driver),
      });
    });
  });
});

// Put a driver in Drivers table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;
  const driver = new Driver({
    ...body,
    id: uuid(),
  });
  db.create(res, driver);
});

// Update an existing driver
router.put('/:id', validateUser('Driver'), (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  if (
    res.locals.user.userType === UserType.ADMIN ||
    id === res.locals.user.id
  ) {
    db.update(res, Driver, { id }, body, tableName);
  } else {
    res.status(400).send({ err: 'User ID does not match request ID' });
  }
});

// Delete an existing driver
router.delete('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.deleteById(res, Driver, id, tableName);
});

export default router;
