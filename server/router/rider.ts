import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import * as db from './common';
import { Locations } from './location';

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
  db.getByID(res, Riders, id);
});

// Get all riders
router.get('/', (req, res) => db.getAll(res, Riders));

// TODO: Get all upcoming rides for a rider
router.get('/:id/rides', (req, res) => {
  res.send();
});

// Get profile information for a rider
router.get('/:id/profile', (req, res) => {
  // const { id } = req.params;
  // console.log('1');
  // db.retrieveByID(res, Riders, id).then((data: any) => {
  //   if (data !== undefined) {
  //     console.log('1');
  //     const rider: RiderType = data;
  //     const {
  //       email, firstName, lastName, phoneNumber, pronouns, joinDate,
  //     } = rider;
  //     res.send({
  //       email, firstName, lastName, phoneNumber, pronouns, joinDate,
  //     });
  //   }
  // });
});

// Get accessibility information for a rider
router.get('/:id/accessibility', async (req, res) => {
  const { id } = req.params;
  console.log('hello');
  const data = db.retrieveByID(res, Riders, id);
  console.log('hello');
  if (data) {
    const rider: RiderType = data as any;
    const { description, accessibilityNeeds } = rider;
    res.send({ description, accessibilityNeeds });
  }
});

// Get all favorite locations for a rider
router.get('/:id/favorites', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data: any) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const rider: RiderType = data;
      const { favoriteLocations } = rider;
      const keys: Key[] = favoriteLocations.map((locID: string) => ({
        id: locID,
      }));
      if (!keys.length) {
        res.send({ data: [] });
      } else {
        Locations.batchGet(keys, (locErr, locData) => {
          if (locErr) {
            res.send({ err: locErr });
          } else {
            res.send({ data: locData });
          }
        });
      }
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
  rider.save((err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(data);
    }
  });
});

// Update a rider in Riders table
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  Riders.update({ id }, postBody, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Add a location to favorites
router.post('/:id/favorites', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  const locID = postBody.id;
  Locations.get(locID, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: 'location not found' } });
    } else {
      const location = data;
      Riders.update({ id }, { $ADD: { favoriteLocations: [locID] } }, (riderErr) => {
        if (riderErr) {
          res.send({ err: riderErr });
        } else {
          res.send(location);
        }
      });
    }
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
