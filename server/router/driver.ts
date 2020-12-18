import express from 'express';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import * as db from './common';
import { Driver, DriverType } from '../models/driver';

const router = express.Router();
const tableName = 'Drivers';

// Get a driver by id in Drivers table
router.get('/:id', (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Driver, id, tableName);
});

// Get all drivers
router.get('/', (req, res) => db.getAll(res, Driver, tableName));

// Get profile information for a driver
router.get('/:id/profile', (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Driver, id, tableName, (driver: DriverType) => {
    const {
      email, firstName, lastName, phoneNumber, availability, vehicle,
    } = driver;
    res.send({
      email, firstName, lastName, phoneNumber, availability, vehicle,
    });
  });
});

// Get whether a driver is available at a given time
// startTime and endTime must be in the format YYYY-MM-DDTHH:MM
router.get('/:id/:startTime/:endTime', (req, res) => {
  const { params: { id, startTime, endTime } } = req;

  const reqStart = moment(startTime);
  const reqEnd = moment(endTime);

  if (reqStart.date() !== reqEnd.date()) {
    res.send({ err: { message: 'startTime and endTime dates must be equal' } });
  }

  const reqStartTime = reqStart.format('HH:mm');
  const reqEndTime = reqEnd.format('HH:mm');

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

    const availStartTime = moment(availStart, 'HH:mm').format('HH:mm');

    if (availStart != null && availStartTime <= reqStartTime) {
      const availEnd = (() => {
        if (reqEndDay === 1) return availability.Mon?.endTime;
        if (reqEndDay === 2) return availability.Tue?.endTime;
        if (reqEndDay === 3) return availability.Wed?.endTime;
        if (reqEndDay === 4) return availability.Thu?.endTime;
        if (reqEndDay === 5) return availability.Fri?.endTime;
        return null;
      })();

      const availEndTime = moment(availEnd, 'HH:mm').format('HH:mm');

      if (availEnd != null && availEndTime >= reqEndTime) {
        available = true;
      }
    }
    res.send(available);
  });
});


// Put a driver in Drivers table
router.post('/', (req, res) => {
  const { body } = req;
  const driver = new Driver({
    ...body,
    id: uuid(),
  });
  db.create(res, driver);
});

// Update an existing driver
router.put('/:id', (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Driver, { id }, body, tableName);
});

// Delete an existing driver
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Driver, id, tableName);
});

export default router;
