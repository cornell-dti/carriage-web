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

export const Vehicle = dynamoose.model('Vehicles', schema, { create: false });

// Get a vehicle by Id in Vehicles table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Vehicle, id, 'Vehicles');
});

// Put a vehicle in Vehicles table
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
  db.update(res, Vehicle, { id }, postBody, 'Vehicles');
});

// Delete an existing vehicle
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Vehicle, id, 'Vehicles');
});

export default router;
