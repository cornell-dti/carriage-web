import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Vehicle } from '../models/vehicle';

const router = express.Router();
const tableName = 'Vehicles';

// Get a vehicle by id
router.get('/:id', (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Vehicle, id, tableName);
});

// Get all vehicles
router.get('/', (req, res) => db.getAll(res, Vehicle, tableName));

// Create a new vehicle
router.post('/', (req, res) => {
  const { body } = req;
  const vehicle = new Vehicle({
    ...body,
    id: uuid(),
  });
  db.create(res, vehicle);
});

// Update an existing vehicle
router.put('/:id', (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  db.update(res, Vehicle, { id }, body, tableName);
});

// Delete an existing vehicle
router.delete('/:id', (req, res) => {
  const {
    params: { id },
  } = req;
  db.deleteById(res, Vehicle, id, tableName);
});

export default router;
