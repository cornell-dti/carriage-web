import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

export type VehicleType = {
  id: string,
  wheelchairAccessible: boolean,
};

const schema = new dynamoose.Schema({
  id: String,
  wheelchairAccessible: Boolean,
});

const tableName = 'Vehicles';

export const Vehicle = dynamoose.model(tableName, schema, { create: false });

// Get a vehicle by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Vehicle, id, tableName);
});

// Get all vehicles
router.get('/', (req, res) => db.getAll(res, Vehicle, tableName));

// Create a new vehicle
router.post('/', (req, res) => {
  const postBody = req.body;
  const vehicle = new Vehicle({
    id: uuid(),
    ...postBody,
  });
  db.create(res, vehicle);
});

// Update an existing vehicle
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Vehicle, { id }, postBody, tableName);
});

// Delete an existing vehicle
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Vehicle, id, tableName);
});

export default router;
