import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose, { Condition } from 'dynamoose';
import * as db from './common';
import { Location } from './location';

const router = express.Router();

type Key = {
  id: string
};

type RiderType = {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  accessibilityNeeds: {
    needsWheelchair: boolean
    hasCrutches: boolean
    needsAssistant: boolean
  }
  description: string
  joinDate: string
  pronouns: string
  address: string
  favoriteLocations: string[]
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessibilityNeeds: {
    type: Object,
    schema: {
      needsWheelchair: Boolean,
      hasCrutches: Boolean,
      needsAssistant: Boolean,
    },
  },
  description: String,
  joinDate: String,
  pronouns: String,
  address: String,
  favoriteLocations: {
    type: Array,
    schema: [{ type: String }],
  },
});

const tableName = 'Riders';

export const Rider = dynamoose.model(tableName, schema, { create: false });

// Get a rider by id in Riders table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getById(res, Rider, id, tableName);
});

// Get all riders
router.get('/', (req, res) => db.getAll(res, Rider, tableName));

// Get profile information for a rider
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
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
router.get('/:id/accessibility', async (req, res) => {
  const { id } = req.params;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const { description, accessibilityNeeds } = rider;
    res.send({ description, accessibilityNeeds });
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', (req, res) => {
  const { id } = req.params;
  db.getById(res, Rider, id, tableName, ({ favoriteLocations }: RiderType) => {
    const keys = db.createKeys('id', favoriteLocations);
    db.batchGet(res, Location, keys, 'Locations');
  });
});

// Create a rider in Riders table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rider = new Rider({
    id: uuid(),
    ...postBody,
    favoriteLocations: [],
  });
  db.create(res, rider);
});

// Update a rider in Riders table
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  db.update(res, Rider, { id }, postBody, tableName);
});

// Add a location to favorites
router.post('/:id/favorites', (req, res) => {
  const { id } = req.params;
  const { id: locId } = req.body;
  // check if location exists in table
  db.getById(res, Location, locId, 'Locations', () => {
    const operation = { $ADD: { favoriteLocations: [locId] } };
    const condition = new Condition('favoriteLocations').not().contains(locId);
    db.conditionalUpdate(
      res, Rider, { id }, operation, condition, tableName, ({ favoriteLocations }: RiderType) => {
        const keys = db.createKeys('id', favoriteLocations);
        db.batchGet(res, Location, keys, 'Locations');
      },
    );
  });
});

// Delete an existing rider
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteById(res, Rider, id, tableName);
});

export default router;
