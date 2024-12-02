import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import moment from 'moment-timezone';
import * as db from './common';
import { Driver, DriverType } from '../models/driver';
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
  const id = body.id || uuid();
  const driver = new Driver({
    id: id,
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
