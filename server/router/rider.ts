import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import jwt from 'jsonwebtoken';
import * as db from './common';
import { Rider, RiderType } from '../models/rider';
import { Location } from '../models/location';
import { createKeys, validateUser } from '../util';

const router = express.Router();
const tableName = 'Riders';

// Get a rider by id in Riders table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName);
});

// Get all riders
router.get('/', validateUser('User'), (req, res) => {
  db.getAll(res, Rider, tableName);
});

// Get profile information for a rider
router.get('/:id/profile', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const {
      email, firstName, lastName, phoneNumber, pronouns, joinDate,
    } = rider;
    res.send({
      email, firstName, lastName, phoneNumber, pronouns, joinDate,
    });
  });
});

// Get accessibility information for a rider
router.get('/:id/accessibility', validateUser('User'), async (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const { description, accessibility } = rider;
    res.send({ description, accessibility });
  });
});

// Get organization information for a rider
router.get('/:id/organization', validateUser('User'), async (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const { description, organization } = rider;
    res.send({ description, organization });
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, ({ favoriteLocations }: RiderType) => {
    const keys = createKeys('id', favoriteLocations);
    db.batchGet(res, Location, keys, 'Locations');
  });
});

// Create a rider in Riders table
router.post('/', validateUser('Rider'), (req, res) => {
  const { body } = req;
  const rider = new Rider({
    ...body,
    id: uuid(),
    favoriteLocations: [],
  });
  db.create(res, rider, (data: RiderType) => {
    const { locals: { user: { id } } } = res;
    if (id) {
      res.send(data);
    } else {
      res.send({
        ...data,
        jwt: jwt.sign({ id: data.id, userType: 'Rider' }, process.env.JWT_SECRET!),
      });
    }
  });
});

// Update a rider in Riders table
router.put('/:id', validateUser('Rider'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Rider, { id }, body, tableName);
});

// Add a location to favorites
router.post('/:id/favorites', validateUser('Rider'), (req, res) => {
  const { params: { id }, body: { id: locId } } = req;
  // check if location exists in table
  db.getById(res, Location, locId, 'Locations', () => {
    const operation = { $ADD: { favoriteLocations: [locId] } };
    const condition = new Condition('favoriteLocations').not().contains(locId);
    db.conditionalUpdate(
      res, Rider, { id }, operation, condition, tableName, ({ favoriteLocations }: RiderType) => {
        const keys = createKeys('id', favoriteLocations);
        db.batchGet(res, Location, keys, 'Locations');
      },
    );
  });
});

// Delete an existing rider
router.delete('/:id', validateUser('Rider'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Rider, id, tableName);
});

export default router;
