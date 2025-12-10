import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose/dist/Condition';
import * as db from './common';
import { Location } from '../models/location';
import { Tag } from '@carriage-web/shared/types/location';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Locations';

// Get a location by id in Locations table
router.get('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Location, id, tableName);
});

// Get and query all locations
router.get('/', validateUser('User'), (req, res) => {
  const { query } = req;
  if (Object.keys(query).length === 0) {
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
        condition = condition.where('tag').eq(Tag.INACTIVE);
      }
    }
    db.scan(res, Location, condition);
  }
});

// Put a location in Locations table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;
  const location = new Location({
    ...body,
    id: uuid(),
  });
  db.create(res, location);
});

// Allows riders to create custom locations
router.post('/custom', validateUser('User'), (req, res) => {
  const { body } = req;
  const location = new Location({ ...body, id: uuid(), tag: Tag.CUSTOM });
  db.create(res, location);
});

// Update an existing location
router.put('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  db.update(res, Location, { id }, body, tableName);
});

// Delete an existing location
router.delete('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.deleteById(res, Location, id, tableName);
});

export default router;
