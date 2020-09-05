import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Driver, DriverType } from '../models/driver';

const router = express.Router();

const tableName = 'Drivers';

// Get a driver by id in Drivers table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Driver, id, tableName);
});

// Get all drivers
router.get('/', (req, res) => db.getAll(res, Driver, tableName));

// Get profile information for a driver
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  db.getById(res, Driver, id, tableName, (driver: DriverType) => {
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
  const driver = new Driver({
    id: uuid(),
    ...postBody,
  });
  db.create(res, driver);
});

// Update an existing driver
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Driver, { id }, postBody, tableName);
});

// Delete an existing driver
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Driver, id, tableName);
});

export default router;
