import express from 'express';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import * as db from './common';
import { Driver, DriverType } from '../models/driver';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Drivers';

// Get a driver by id in Drivers table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Driver, id, tableName);
});

// Get all drivers
router.get('/', validateUser('User'), (req, res) => {
  db.getAll(res, Driver, tableName);
});

// Get profile information for a driver
router.get('/:id/profile', validateUser('User'), (req, res) => {
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

// Put a driver in Drivers table
router.post('/', validateUser('Driver'), (req, res) => {
  const { body } = req;
  const driver = new Driver({
    ...body,
    id: uuid(),
  });
  db.create(res, driver, (data: DriverType) => {
    const { locals: { user: { id } } } = res;
    if (id) {
      res.send(data);
    } else {
      res.send({
        ...data,
        jwt: jwt.sign({ id: data.id, userType: 'Driver' }, process.env.JWT_SECRET!),
      });
    }
  });
});

// Update an existing driver
router.put('/:id', validateUser('Driver'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Driver, { id }, body, tableName);
});

// Delete an existing driver
router.delete('/:id', validateUser('Driver'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Driver, id, tableName);
});

export default router;
