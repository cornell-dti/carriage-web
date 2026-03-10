import express from 'express';
import { prisma } from '../db/prisma';
import { validateUser } from '../util';

const router = express.Router();

// Favorite a ride.
router.post('/', validateUser('User'), async (req, res) => {
  try {
    const { rideId } = req.body;
    const userId = res.locals.user.id;

    if (!rideId) {
      return res.status(400).send({ err: 'rideId is required' });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      return res.status(404).send({
        err: 'Ride not found, unable to favorite a ride that does not exist.',
      });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_rideId: { userId, rideId } },
    });

    if (existingFavorite) {
      return res.status(222).send({ msg: 'Ride already favorited' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        rideId,
        favoritedAt: new Date(),
      },
    });

    res.send(favorite);
  } catch (error) {
    console.error('Error favoriting ride:', error);
    res.status(500).send({ err: 'Failed to favorite ride' });
  }
});

// Get all favorite rides for the current user
router.get('/', validateUser('User'), async (req, res) => {
  try {
    const userId = res.locals.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { ride: { include: { startLocation: true, endLocation: true, riders: true, driver: true } } },
    });

    const rides = favorites.map((fav) => fav.ride);
    res.send({ data: rides });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).send({ err: 'Failed to fetch favorites' });
  }
});

// Check if a ride is favorited and get its data
router.get('/:rideId', validateUser('User'), async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { rideId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { userId_rideId: { userId, rideId } },
    });

    if (!favorite) {
      return res.status(404).send({ err: 'Favorite not found' });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { startLocation: true, endLocation: true, riders: true, driver: true },
    });

    res.send(ride);
  } catch (error) {
    console.error('Error fetching favorited ride:', error);
    res.status(500).send({ err: 'Failed to fetch favorited ride' });
  }
});

// Delete a ride from a user's favorites
router.delete('/:rideId', validateUser('User'), async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = res.locals.user.id;

    await prisma.favorite.delete({
      where: { userId_rideId: { userId, rideId } },
    });

    res.status(200).send({ userId, rideId });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'Favorite not found' });
    }
    console.error('Error deleting favorite:', error);
    res.status(500).send({ err: 'Failed to delete favorite' });
  }
});

export default router;
