import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Location } from '../models/location';

const router = express.Router();
const tableName = 'Locations';

// Get a location by id in Locations table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Location, id, tableName);
});

// Get all locations
router.get('/', (req, res) => db.getAll(res, Location, tableName));

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
  db.update(res, Location, { id }, postBody, tableName);
});

// Delete an existing location
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Location, id, tableName);
});

export default router;
