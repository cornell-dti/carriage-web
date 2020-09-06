import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Location } from '../models/location';

const router = express.Router();
const tableName = 'Locations';

// Get a location by id in Locations table
router.get('/:id', (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Location, id, tableName);
});

// Get all locations
router.get('/', (req, res) => db.getAll(res, Location, tableName));

// Put a location in Locations table
router.post('/', (req, res) => {
  const { body } = req;
  const location = new Location({
    id: uuid(),
    ...body,
  });
  db.create(res, location);
});

// Update an existing location
router.post('/', (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Location, { id }, body, tableName);
});

// Delete an existing location
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Location, id, tableName);
});

export default router;
