import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose/dist/Condition';
import * as db from './common';
import { Location, Tag } from '../models/location';
import { formatAddress } from '../util';

const router = express.Router();
const tableName = 'Locations';

// Get a location by id in Locations table
router.get('/:id', (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Location, id, tableName);
});

// Get and query all locations
router.get('/', (req, res) => {
  const { query } = req;
  if (query === {}) {
    db.getAll(res, Location, tableName);
  } else {
    const { active } = query;
    let condition = new Condition();
    if (active) {
      if (active === 'true') {
        condition = condition
          .where('tag')
          .not()
          .eq(Tag.INACTIVE)
          .where('tag')
          .not()
          .eq(Tag.CUSTOM);
      } else {
        condition = condition
          .where('tag')
          .eq(Tag.INACTIVE);
      }
    }
    db.scan(res, Location, condition);
  }
});

// Put a location in Locations table
router.post('/', (req, res) => {
  const { body: { name, address } } = req;
  const location = new Location({
    id: uuid(),
    name,
    address: formatAddress(address),
  });
  db.create(res, location);
});

// Update an existing location
router.put('/:id', (req, res) => {
  const { params: { id }, body } = req;
  const { address } = body;
  if (address) {
    body.address = formatAddress(address);
  }
  db.update(res, Location, { id }, body, tableName);
});

// Delete an existing location
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Location, id, tableName);
});

export default router;
