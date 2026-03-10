import express from 'express';
import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';
import { prisma } from '../db/prisma';
import { Accessibility, RideType, RideStatus } from '../../generated/prisma/client';
import { validateUser, checkNetIDExists, checkNetIDExistsForOtherEmployee } from '../util';

const router = express.Router();

// Get rider usage stats across all rides
router.get('/usage', validateUser('Admin'), async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where: { type: RideType.PAST },
      include: { riders: true },
    });

    const usageObj: Record<string, { noShows: number; totalRides: number }> = {};

    for (const ride of rides) {
      for (const rider of ride.riders) {
        if (!(rider.id in usageObj)) {
          usageObj[rider.id] = { noShows: 0, totalRides: 0 };
        }
        if (ride.status === RideStatus.COMPLETED) {
          usageObj[rider.id].totalRides += 1;
        } else {
          usageObj[rider.id].noShows += 1;
        }
      }
    }

    res.send(usageObj);
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).send({ err: 'Failed to fetch usage' });
  }
});

// Get a rider by id
router.get('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    res.status(200).json({ data: rider });
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).send({ err: 'Failed to fetch rider' });
  }
});

// Get all riders
router.get('/', validateUser('Admin'), async (req, res) => {
  try {
    const riders = await prisma.rider.findMany();
    res.status(200).send({ data: riders });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).send({ err: 'Failed to fetch riders' });
  }
});

// Get profile information for a rider
router.get('/:id/profile', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    const { email, firstName, lastName, phoneNumber, joinDate, endDate } = rider;
    res.send({ email, firstName, lastName, phoneNumber, joinDate, endDate });
  } catch (error) {
    console.error('Error fetching rider profile:', error);
    res.status(500).send({ err: 'Failed to fetch rider profile' });
  }
});

// Get accessibility information for a rider
router.get('/:id/accessibility', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    res.send({ description: rider.description, accessibility: rider.accessibility });
  } catch (error) {
    console.error('Error fetching accessibility:', error);
    res.status(500).send({ err: 'Failed to fetch accessibility' });
  }
});

// Get organization information for a rider
router.get('/:id/organization', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    res.send({ description: rider.description, organization: rider.organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).send({ err: 'Failed to fetch organization' });
  }
});

// Get all favorite locations for a rider
router.get('/:id/favorites', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { favorites: { include: { ride: { include: { startLocation: true, endLocation: true } } } } },
    });
    if (!rider) {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    res.status(200).send({ data: rider.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).send({ err: 'Failed to fetch favorites' });
  }
});

// Get current/soonest ride (within next 30 min) of rider
router.get('/:id/currentride', validateUser('Rider'), async (req, res) => {
  try {
    const { id } = req.params;
    const now = moment().toDate();
    const soon = moment().add(30, 'minutes').toDate();

    const rides = await prisma.ride.findMany({
      where: {
        type: RideType.ACTIVE,
        riders: { some: { id } },
        OR: [
          { startTime: { gte: now, lte: soon } },
          { startTime: { lte: now }, endTime: { gte: now } },
        ],
      },
      include: { startLocation: true, endLocation: true, riders: true, driver: true },
      orderBy: { startTime: 'asc' },
    });

    res.send(rides[0] ?? {});
  } catch (error) {
    console.error('Error fetching current ride:', error);
    res.status(500).send({ err: 'Failed to fetch current ride' });
  }
});

// Get usage stats for a specific rider
router.get('/:id/usage', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const rides = await prisma.ride.findMany({
      where: { riders: { some: { id } } },
    });

    const studentRides = rides.filter((r) => r.status === RideStatus.COMPLETED).length;
    const noShowCount = rides.filter((r) => r.status === RideStatus.NO_SHOW).length;

    res.send({ studentRides, noShowCount });
  } catch (error) {
    console.error('Error fetching rider usage:', error);
    res.status(500).send({ err: 'Failed to fetch rider usage' });
  }
});

// Create a rider
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;

    const emailExists = await checkNetIDExists(body.email, 'rider');
    if (emailExists) {
      return res.status(409).send({ err: 'A user with this NetID already exists' });
    }

    // Uppercase accessibility enums if provided
    const accessibility = body.accessibility
      ? body.accessibility.map((a: string) => a.toUpperCase() as Accessibility)
      : [];

    const rider = await prisma.rider.create({
      data: {
        ...body,
        id: uuid(),
        accessibility,
            joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
    endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    res.status(201).json(rider);
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ error: 'Failed to create rider' });
  }
});

// Update a rider
router.put('/:id', validateUser('Rider'), async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (
      res.locals.user.userType !== 'Admin' &&
      id !== res.locals.user.id
    ) {
      return res.status(400).send({ err: 'User ID does not match request ID' });
    }

    if (body.email) {
      const emailExists = await checkNetIDExistsForOtherEmployee(body.email, id);
      if (emailExists) {
        return res.status(409).send({ err: 'A user with this NetID already exists' });
      }
    }

    // Uppercase accessibility enums if provided
    if (body.accessibility && Array.isArray(body.accessibility)) {
      body.accessibility = body.accessibility.map((a: string) => a.toUpperCase() as Accessibility);
    }

    const rider = await prisma.rider.update({
      where: { id },
      data: body,
    });

    res.status(200).send({ data: rider });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    console.error('Error updating rider:', error);
    res.status(500).send({ err: 'Failed to update rider' });
  }
});

// Add a ride to favorites
router.post('/:id/favorites', validateUser('Rider'), async (req, res) => {
  try {
    const { id } = req.params;
    const { id: rideId } = req.body;

    // Check ride exists
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }

    // Upsert to avoid duplicates
    await prisma.favorite.upsert({
      where: { userId_rideId: { userId: id, rideId } },
      update: {},
      create: { userId: id, rideId },
    });

    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      include: { ride: { include: { startLocation: true, endLocation: true } } },
    });

    res.status(200).send({ data: favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).send({ err: 'Failed to add favorite' });
  }
});

// Delete an existing rider
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.rider.delete({ where: { id } });
    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Riders' });
    }
    console.error('Error deleting rider:', error);
    res.status(500).send({ err: 'Failed to delete rider' });
  }
});

export default router;