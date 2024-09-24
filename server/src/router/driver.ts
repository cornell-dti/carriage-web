import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import moment from 'moment-timezone';
import * as db from './common';
import { Driver, DriverType, AvailabilityType } from '../models/driver';
import { validateUser } from '../util';
import { Ride, Status } from '../models/ride';
import { UserType } from '../models/subscription';
import { Item } from 'dynamoose/dist/Item';

const router = express.Router();
const tableName = 'Drivers';

// Get all drivers
router.get('/', validateUser('Admin'), (req, res) => {
  db.getAll(res, Driver, tableName);
});

// Get all available drivers at a specific date and time
router.get('/available', validateUser('User'), (req, res) => {
  const { date, startTime, endTime } = req.query;
  const reqStartTime = startTime as string;
  const reqEndTime = endTime as string;
  const numToDay: (keyof AvailabilityType | undefined)[] = [
    undefined,
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    undefined,
  ];
  const reqDate = numToDay[moment(date as string).day()];

  if (reqStartTime >= reqEndTime) {
    res.status(400).send({ err: 'startTime must precede endTime' });
  }

  db.getAll(res, Driver, tableName, (doc: DriverType[]) => {
    const drivers = doc.filter((driver) => {
      const availStart = reqDate && driver.availability[reqDate]?.startTime;
      const availEnd = reqDate && driver.availability[reqDate]?.endTime;

      if (availStart === undefined || availEnd === undefined) {
        return false;
      }

      return availEnd >= reqEndTime && availStart <= reqStartTime;
    });

    res.send({ data: drivers });
  });
});

// Get a driver by id in Drivers table
router.get('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Driver, id, tableName);
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
    db.scan(res, Ride, condition, (data: Item[]) => {
      res.send({
        data: {
          rides: data.length,
          workingHours: calculateHoursWorked(driver),
        },
      });
    });
  });
});

// Put a driver in Drivers table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;
  const driver = new Driver({
    id: uuid(),
    ...body,
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
