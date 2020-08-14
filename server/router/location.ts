import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

export type LocationType = {
  id: string,
  name: string,
  address: string,
};

const schema = new dynamoose.Schema({
  id: String,
  name: String,
  address: String,
});

export const Locations = dynamoose.model('Locations', schema, { create: false });

// Get a location by ID in Locations table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Locations, id, 'Locations');
});

// Get all locations
router.get('/', (req, res) => db.getAll(res, Locations, 'Locations'));

// Put a location in Locations table
router.post('/', (req, res) => {
  const postBody = req.body;
  const location = new Locations({
    id: uuid(),
    name: postBody.name,
    address: postBody.address,
  });
  db.create(res, location);
});

// Update an existing location
router.post('/', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Locations, { id }, postBody, 'Locations');
});

// Delete an existing location
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteByID(res, Locations, id, 'Locations');
});

export default router;
