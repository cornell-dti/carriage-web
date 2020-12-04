import express from 'express';
import { v4 as uuid } from 'uuid';
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

// Put a driver in Drivers table
router.post('/', (req, res) => {
  const { body } = req;
  const driver = new Driver({
    ...body,
    id: uuid()
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
