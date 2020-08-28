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

const table = 'Locations';

export const Location = dynamoose.model(table, schema, { create: false });

// Get a location by id in Locations table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Location, id, table);
});

// Get all locations
router.get('/', (req, res) => db.getAll(res, Location, table));

// Put a location in Locations table
router.post('/', (req, res) => {
  const postBody = req.body;
  const location = new Location({
    id: uuid(),
    ...postBody,
  });
  db.create(res, location);
});

// Update an existing location
router.post('/', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Location, { id }, postBody, table);
});

// Delete an existing location
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Location, id, table);
});

export default router;
