import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import moment from 'moment-timezone';
import * as db from './common';
import { Driver } from '../models/driver';
import { validateUser } from '../util';
import { Ride } from '../models/ride';
import { UserType } from '../models/subscription';
import { Item } from 'dynamoose/dist/Item';
import { Status } from '@shared/types/ride';
import { DriverType } from '@shared/types/driver';

const router = express.Router();
const tableName = 'Drivers';

// Get all drivers
router.get('/', validateUser('Admin'), (req, res) => {
  db.getAll(res, Driver, tableName);
});

// Get available drivers for a given date and time window
// Example: /api/drivers/available?date=2025-09-10&startTime=10:00&endTime=12:00
router.get('/available', validateUser('User'), (req, res) => {
  const { date, startTime, endTime, timezone } = req.query as {
    date?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };

  if (!date || !startTime || !endTime) {
    res
      .status(400)
      .send({ err: 'Missing required query params: date, startTime, endTime' });
    return;
  }

  const tz = timezone || 'America/New_York';

  // Build requested time window ISO strings
  const requestedStartIso = moment
    .tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', tz)
    .toISOString();
  const requestedEndIso = moment
    .tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', tz)
    .toISOString();

  // Build full-day window for scanning rides
  const dayStartIso = moment
    .tz(date, 'YYYY-MM-DD', tz)
    .startOf('day')
    .toISOString();
  const dayEndIso = moment
    .tz(date, 'YYYY-MM-DD', tz)
    .endOf('day')
    .toISOString();

  // Map JS weekday to our DayOfWeek enum values
  const weekday = moment.tz(date, 'YYYY-MM-DD', tz).format('ddd'); // e.g., Mon, Tue, Wed
  const dayMap: Record<string, string> = {
    Mon: 'MON',
    Tue: 'TUE',
    Wed: 'WED',
    Thu: 'THURS',
    Fri: 'FRI',
    Sat: 'SAT',
    Sun: 'SUN',
  };
  const dayToken = dayMap[weekday];

  // Scan rides for that day to detect conflicts
  const rideCondition = new Condition()
    .where('startTime')
    .between(dayStartIso, dayEndIso)
    .where('status')
    .not()
    .eq(Status.CANCELLED);

  db.scan(res, Ride, rideCondition, (ridesOfDay: any[]) => {
    // Then fetch all drivers, and filter by availability and conflicts
    db.getAll(res, Driver, tableName, (allDrivers: any[]) => {
      // Filter active drivers first
      const activeDrivers = allDrivers.filter((d) => d.active !== false);

      // Filter by weekday availability if we have a valid token
      const dayFilteredDrivers = dayToken
        ? activeDrivers.filter(
            (d) =>
              Array.isArray(d.availability) && d.availability.includes(dayToken)
          )
        : activeDrivers;

      const reqStart = requestedStartIso;
      const reqEnd = requestedEndIso;

      // Helper to check time overlap
      const overlaps = (rideStartIso: string, rideEndIso: string) => {
        return !(rideEndIso <= reqStart || rideStartIso >= reqEnd);
      };

      // Build a lookup of driverId -> hasConflict
      const conflictingDriverIds = new Set<string>();
      for (const ride of ridesOfDay) {
        if (!ride.driver || !ride.driver.id) continue;
        if (overlaps(ride.startTime, ride.endTime)) {
          conflictingDriverIds.add(ride.driver.id);
        }
      }

      const availableDrivers = dayFilteredDrivers.filter(
        (d) => !conflictingDriverIds.has(d.id)
      );

      res.send({ data: availableDrivers });
    });
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
    const { email, firstName, lastName, phoneNumber, photoLink } = driver;
    res.send({
      email,
      firstName,
      lastName,
      phoneNumber,
      photoLink,
    });
  });
});

// Put a driver in Drivers table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;

  // Map startDate from payload to joinDate in model
  const joinDate = body.startDate || body.joinDate;

  const admin = new Driver({
    id: !body.eid || body.eid === '' ? uuid() : body.eid,
    firstName: body.firstName,
    lastName: body.lastName,
    availability: body.availability,
    phoneNumber: body.phoneNumber,
    joinDate,
    email: body.email,
  });
  if (!Array.isArray(body.availability)) {
    res.status(469).send({
      err:
        'Expected availability to be of type array, instead found type ' +
        typeof body.availability +
        '.',
    });
  } else {
    db.create(res, admin);
  }
});

// Update an existing driver
router.put('/:id', validateUser('Driver'), (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  // Allow startDate in payload by mapping to joinDate
  if (body.startDate && !body.joinDate) {
    body.joinDate = body.startDate;
    delete body.startDate;
  }
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

// Get a driver's weekly stats

router.get('/:id/stats', validateUser('Admin'), (req, res) => {});

export default router;
