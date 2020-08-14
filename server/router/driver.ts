import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

type BreakTimes = {
  breakStart: string,
  breakEnd: string,
}

type BreakType = {
  Mon?: BreakTimes,
  Tue?: BreakTimes,
  Wed?: BreakTimes,
  Thu?: BreakTimes,
  Fri?: BreakTimes,
}

type DriverType = {
  id: string,
  firstName: string,
  lastName: string,
  startTime: string,
  endTime: string,
  breaks: BreakType,
  vehicle: string,
  phoneNumber: string,
  email: string,
};

const breakDayValue = Object({
  type: Object,
  schema: Object({
    breakStart: String,
    breakEnd: String,
  }),
});

const breakSchema = Object.fromEntries(
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => [d, breakDayValue]),
);

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  startTime: String,
  endTime: String,
  breaks: {
    type: Object,
    schema: breakSchema,
  },
  vehicle: String,
  phoneNumber: String,
  email: String,
}, { saveUnknown: true });

export const Drivers = dynamoose.model('Drivers', schema, { create: false });

// Get a driver by ID in Drivers table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Drivers, id, 'Drivers');
});

// Get all drivers
router.get('/', (req, res) => db.getAll(res, Drivers, 'Drivers'));

// Get profile information for a driver
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Drivers, id, 'Drivers', (driver: DriverType) => {
    const {
      email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
    } = driver;
    res.send({
      email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
    });
  });
});

// Put a driver in Drivers table
router.post('/', (req, res) => {
  const postBody = req.body;
  const driver = new Drivers({
    id: uuid(),
    ...postBody,
  });
  db.create(res, driver);
});

// Update an existing driver
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Drivers, { id }, postBody, 'Drivers');
});

// Delete an existing driver
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteByID(res, Drivers, id, 'Drivers');
});

export default router;
