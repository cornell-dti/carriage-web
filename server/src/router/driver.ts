import express from 'express';
import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';
import { prisma } from '../db/prisma';
import { DayOfWeek } from '../../generated/prisma/client';
import { validateUser, checkNetIDExists, checkNetIDExistsForOtherEmployee } from '../util';

const router = express.Router();

// Get all drivers
router.get('/', validateUser('Admin'), async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.status(200).send({ data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).send({ err: 'Failed to fetch drivers' });
  }
});

// Get available drivers for a given date and time window
// Example: /api/drivers/available?date=2025-09-10&startTime=10:00&endTime=12:00
router.get('/available', validateUser('User'), async (req, res) => {
  const { date, startTime, endTime, timezone } = req.query as {
    date?: string;
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };

  if (!date || !startTime || !endTime) {
    return res.status(400).send({ err: 'Missing required query params: date, startTime, endTime' });
  }

  const tz = timezone || 'America/New_York';

  const requestedStart = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', tz).toDate();
  const requestedEnd = moment.tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', tz).toDate();
  const dayStart = moment.tz(date, 'YYYY-MM-DD', tz).startOf('day').toDate();
  const dayEnd = moment.tz(date, 'YYYY-MM-DD', tz).endOf('day').toDate();

  const weekday = moment.tz(date, 'YYYY-MM-DD', tz).format('ddd');
  const dayMap: Record<string, DayOfWeek> = {
    Mon: DayOfWeek.MON,
    Tue: DayOfWeek.TUE,
    Wed: DayOfWeek.WED,
    Thu: DayOfWeek.THURS,
    Fri: DayOfWeek.FRI,
  };
  const dayToken = dayMap[weekday];

  try {
    // Get rides for that day that aren't cancelled
    const ridesOfDay = await prisma.ride.findMany({
      where: {
        startTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
        driverId: { not: null },
      },
    });

    // Find conflicting driver IDs
    const conflictingDriverIds = new Set<string>();
    for (const ride of ridesOfDay) {
      if (!ride.driverId) continue;
      const rideStart = ride.startTime.toISOString();
      const rideEnd = ride.endTime.toISOString();
      const reqStart = requestedStart.toISOString();
      const reqEnd = requestedEnd.toISOString();
      if (!(rideEnd <= reqStart || rideStart >= reqEnd)) {
        conflictingDriverIds.add(ride.driverId);
      }
    }

    // Fetch active drivers filtered by availability
    const drivers = await prisma.driver.findMany({
      where: {
        active: true,
        ...(dayToken ? { availability: { has: dayToken } } : {}),
      },
    });

    const availableDrivers = drivers.filter((d) => !conflictingDriverIds.has(d.id));
    res.send({ data: availableDrivers });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    res.status(500).send({ err: 'Failed to fetch available drivers' });
  }
});

// Get a driver by id
router.get('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return res.status(400).send({ err: 'id not found in Drivers' });
    }
    res.status(200).json({ data: driver });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).send({ err: 'Failed to fetch driver' });
  }
});

// Get profile information for a driver
router.get('/:id/profile', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return res.status(400).send({ err: 'id not found in Drivers' });
    }
    const { email, firstName, lastName, phoneNumber, photoLink } = driver;
    res.send({ email, firstName, lastName, phoneNumber, photoLink });
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).send({ err: 'Failed to fetch driver profile' });
  }
});

// Create a driver
router.post('/', validateUser('Admin'), async (req, res) => {
  console.log('driver post body:', req.body);
  try {
    const { body } = req;

    if (!Array.isArray(body.availability)) {
      return res.status(469).send({
        err: 'Expected availability to be of type array, instead found type ' + typeof body.availability + '.',
      });
    }

    const emailExists = await checkNetIDExists(body.email, 'driver');
    if (emailExists) {
      return res.status(409).send({ err: 'An employee with this NetID already exists' });
    }

    const joinDate = body.startDate || body.joinDate;

    const driver = await prisma.driver.create({
      data: {
        id: !body.eid || body.eid === '' ? uuid() : body.eid,
        firstName: body.firstName,
        lastName: body.lastName,
        availability: body.availability.map((d: string) => d.toUpperCase() as DayOfWeek),
        phoneNumber: body.phoneNumber,
        email: body.email,
        photoLink: body.photoLink,
        ...(joinDate ? { joinDate: new Date(joinDate) } : {}),
      },
    });

    res.status(200).send({ data: driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).send({ err: 'Failed to create driver' });
  }
});

// Update an existing driver
router.put('/:id', validateUser('Driver'), async (req, res) => {
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
        return res.status(409).send({ err: 'An employee with this NetID already exists' });
      }
    }

    // Map startDate -> joinDate
    if (body.startDate && !body.joinDate) {
      body.joinDate = new Date(body.startDate);
      delete body.startDate;
    }

    // Uppercase availability enums if provided
    if (body.availability && Array.isArray(body.availability)) {
      body.availability = body.availability.map((d: string) => d.toUpperCase() as DayOfWeek);
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: body,
    });

    res.status(200).send({ data: driver });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Drivers' });
    }
    console.error('Error updating driver:', error);
    res.status(500).send({ err: 'Failed to update driver' });
  }
});

// Delete an existing driver
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.driver.delete({ where: { id } });
    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Drivers' });
    }
    console.error('Error deleting driver:', error);
    res.status(500).send({ err: 'Failed to delete driver' });
  }
});

// Get a driver's weekly stats (stub)
router.get('/:id/stats', validateUser('Admin'), (req, res) => { });

export default router;