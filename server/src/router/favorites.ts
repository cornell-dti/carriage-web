import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Ride } from '../models/ride';
import { Condition } from 'dynamoose';
import { Favorite } from '../models/favorite';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Favorites';

// Favorite a ride.
router.post('/', validateUser('User'), async (req, res) => {
  const { rideId } = req.body;
  const userId = res.locals.user.id;

  if (!rideId) {
    return res.status(400).send({ err: 'rideId is required' });
  }

  const ride = await new Promise((resolve) => {
    db.getById(res, Ride, rideId, 'Rides', (rideData) => {
      resolve(rideData);
    });
  });

  if (!ride) {
    return res.status(404).send({
      err: 'Ride not found, unable to favorite a ride that does not exist.',
    });
  }

  const existingFavorite = await new Promise((resolve) => {
    db.getById(res, Favorite, { userId, rideId }, tableName, (fav) => {
      resolve(fav);
    });
  });

  if (existingFavorite) {
    return res.status(222).send({ msg: 'Ride already favorited' });
  }

  const favoriteRide = new Favorite({
    userId,
    rideId,
    favoritedAt: new Date(),
  });

  db.create(res, favoriteRide, (doc) => res.send(doc));
});

// Get all favorite rides for the current user
router.get('/', validateUser('User'), (req, res) => {
  const userId = res.locals.user.id;

  const condition = new Condition().where('userId').eq(userId);
  db.query(
    res,
    Favorite,
    condition,
    'userId-index',
    (favorites: (typeof Favorite)[]) => {
      const rideIds = favorites.map((favoriteRide) => favoriteRide.rideId);
      if (rideIds.length === 0) {
        return res.send({ data: [] }); // no favorites
      }
      const keys = rideIds.map((id) => ({ id }));
      db.batchGet(res, Ride, keys, 'Rides', (rides) => {
        res.send({ data: rides });
      });
    }
  );
});

// Check if a ride is favorited and get its data
router.get('/:rideId', validateUser('User'), (req, res) => {
  const userId = res.locals.user.id;
  const rideId = req.body.rideId;

  db.getById(res, Favorite, { userId, rideId }, tableName, () => {
    db.getById(res, Ride, rideId, 'Rides', (rideData) => {
      res.send(rideData);
    });
  });
});

// Delete a ride from a user's favorites
router.delete('/:rideId', validateUser('User'), (req, res) => {
  const { rideId } = req.params;
  const userId = res.locals.user.id;

  db.deleteById(res, Favorite, { userId, rideId }, tableName);
});

export default router;
