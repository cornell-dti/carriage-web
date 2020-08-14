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

export const Vehicles = dynamoose.model('Vehicles', schema, { create: false });

// Get a vehicle by ID in Vehicles table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Vehicles, id, 'Vehicles');
});

// Put a vehicle in Vehicles table
router.post('/', (req, res) => {
  const postBody = req.body;
  const vehicle = new Vehicles({
    id: uuid(),
    ...postBody,
  });
  db.create(res, vehicle);
});

// TODO: Update an existing vehicle

// TODO: Update an existing vehicle

export default router;
