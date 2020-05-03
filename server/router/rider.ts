import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import * as db from './common';
import { Locations, LocationType } from './location';

const router = express.Router();

type Key = {
  id: string
};

type RiderType = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessibilityNeeds: {
    needsWheelchair: boolean,
    hasCrutches: boolean,
    needsAssistant: boolean,
  },
  description: string,
  joinDate: string,
  pronouns: string,
  address: string,
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

export const Riders = dynamoose.model('Riders', schema, { create: false });

// Get a rider by ID in Riders table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Riders, id, 'Riders');
});

// Get all riders
router.get('/', (req, res) => db.getAll(res, Riders, 'Riders'));

// TODO: Get all upcoming rides for a rider
router.get('/:id/rides', (req, res) => {
  res.send();
});

// Get profile information for a rider
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Riders, id, 'Riders', (data) => {
    const rider: RiderType = data;
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
  db.getByID(res, Riders, id, 'Riders', (data) => {
    const rider: RiderType = data;
    const { description, accessibilityNeeds } = rider;
    res.send({ description, accessibilityNeeds });
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Riders, id, 'Riders', (data) => {
    const rider: RiderType = data;
    const { favoriteLocations } = rider;
    const keys: Key[] = favoriteLocations.map((locID: string) => ({
      id: locID,
    }));
    if (!keys.length) {
      res.send({ data: [] });
    } else {
      db.batchGet(res, Locations, keys, 'Locations');
    }
  });
});

// Create a rider in Riders table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rider = new Riders({
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
  db.update(res, Riders, { id }, postBody, 'Riders');
});

// Add a location to favorites
router.post('/:id/favorites', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  const locID = postBody.id;
  db.getByID(res, Locations, locID, 'Locations', (data) => {
    const location: LocationType = data;
    const updateObj = { $ADD: { favoriteLocations: [locID] } };
    db.update(res, Riders, { id }, updateObj, 'Riders', () => res.send(location));
  });
});

// Delete an existing rider
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: 'id not found' } });
    } else {
      data.delete().then(() => res.send({ id }));
    }
  });
});

export default router;
