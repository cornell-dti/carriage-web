import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';
import { Locations, LocationType } from './location';

const router = express.Router();

type Key = {
  id: string
};

type RideKeyType = {
  id: string
  startTime: string
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
  requestedRides: RideKeyType[]
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
  requestedRides: {
    type: Array,
    schema: [{
      type: Object,
      schema: Object({ id: String, startTime: String }),
    }],
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

// Get profile information for a rider
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Riders, id, 'Riders', (rider: RiderType) => {
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
  db.getByID(res, Riders, id, 'Riders', (rider: RiderType) => {
    const { description, accessibilityNeeds } = rider;
    res.send({ description, accessibilityNeeds });
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Riders, id, 'Riders', ({ favoriteLocations }: RiderType) => {
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
    requestedRides: [],
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
  db.getByID(res, Locations, locID, 'Locations', (location: LocationType) => {
    const updateObj = { $ADD: { favoriteLocations: [locID] } };
    db.update(res, Riders, { id }, updateObj, 'Riders', () => res.send(location));
  });
});

// Delete an existing rider
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteByID(res, Riders, id, 'Riders');
});

export default router;
