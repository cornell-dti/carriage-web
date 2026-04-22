import express from 'express';
import { v4 as uuid } from 'uuid';
import moment from 'moment-timezone';
import { prisma } from '../db/prisma';
import { DayOfWeek } from '../../generated/prisma/client';
import {
  validateUser,
  checkRiderEmailExists,
  checkNetIDExistsForOtherEmployee,
} from '../util';

const router = express.Router();

// Get all drivers
router.get('/', validateUser('Admin'), async (req, res) => {
  try {
    const drivers = await prisma.employee.findMany({
      where: { isDriver: true },
    });
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
    return res
      .status(400)
      .send({ err: 'Missing required query params: date, startTime, endTime' });
  }

  const tz = timezone || 'America/New_York';

  const requestedStart = moment
    .tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', tz)
    .toDate();
  const requestedEnd = moment
    .tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', tz)
    .toDate();
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
    const ridesOfDay = await prisma.ride.findMany({
      where: {
        startTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
        driverId: { not: null },
      },
    });

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

    const drivers = await prisma.employee.findMany({
      where: {
        isDriver: true,
        active: true,
        ...(dayToken ? { availability: { has: dayToken } } : {}),
      },
    });

    const availableDrivers = (drivers as { id: string }[]).filter(
      (d) => !conflictingDriverIds.has(d.id)
    );
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
    const driver = await prisma.employee.findUnique({ where: { id } });
    if (!driver) {
      return res.status(400).send({ err: 'id not found in Employees' });
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
    const driver = await prisma.employee.findUnique({ where: { id } });
    if (!driver) {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    const { email, firstName, lastName, phoneNumber, photoLink } = driver;
    res.send({ email, firstName, lastName, phoneNumber, photoLink });
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).send({ err: 'Failed to fetch driver profile' });
  }
});

// Create or promote an employee to driver
router.post('/', validateUser('Admin'), async (req, res) => {
  console.log('driver post body:', req.body);
  try {
    const { body } = req;

    if (!Array.isArray(body.availability)) {
      return res.status(469).send({
        err:
          'Expected availability to be of type array, instead found type ' +
          typeof body.availability +
          '.',
      });
    }

    const riderExists = await checkRiderEmailExists(body.email);
    if (riderExists) {
      return res
        .status(409)
        .send({ err: 'A rider with this NetID already exists' });
    }

    const availability = body.availability.map(
      (d: string) => d.toUpperCase() as DayOfWeek
    );
    const joinDate = body.startDate || body.joinDate;

    // Upsert: if employee already exists (e.g. was an admin), promote them to driver
    const existing = await prisma.employee.findUnique({
      where: { email: body.email },
    });

    let driver;
    if (existing) {
      driver = await prisma.employee.update({
        where: { id: existing.id },
        data: {
          firstName: body.firstName ?? existing.firstName,
          lastName: body.lastName ?? existing.lastName,
          phoneNumber: body.phoneNumber ?? existing.phoneNumber,
          photoLink: body.photoLink ?? existing.photoLink,
          isDriver: true,
          availability,
          ...(joinDate ? { joinDate: new Date(joinDate) } : {}),
        },
      });
    } else {
      const id = !body.eid || body.eid === '' ? uuid() : body.eid;
      driver = await prisma.employee.create({
        data: {
          id,
          firstName: body.firstName,
          lastName: body.lastName,
          availability,
          phoneNumber: body.phoneNumber,
          email: body.email,
          photoLink: body.photoLink,
          isDriver: true,
          ...(joinDate ? { joinDate: new Date(joinDate) } : {}),
        },
      });
    }

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

    if (res.locals.user.userType !== 'Admin' && id !== res.locals.user.id) {
      return res.status(400).send({ err: 'User ID does not match request ID' });
    }

    if (body.email) {
      const emailExists = await checkNetIDExistsForOtherEmployee(
        body.email,
        id
      );
      if (emailExists) {
        return res
          .status(409)
          .send({ err: 'An employee with this NetID already exists' });
      }
    }

    if (body.startDate && !body.joinDate) {
      body.joinDate = new Date(body.startDate);
      delete body.startDate;
    }

    if (body.availability && Array.isArray(body.availability)) {
      body.availability = body.availability.map(
        (d: string) => d.toUpperCase() as DayOfWeek
      );
    }

    if (body.joinDate && !String(body.joinDate).includes('T')) {
      body.joinDate = new Date(body.joinDate).toISOString();
    }

    const driver = await prisma.employee.update({
      where: { id },
      data: body,
    });

    res.status(200).send({ data: driver });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    console.error('Error updating driver:', error);
    res.status(500).send({ err: 'Failed to update driver' });
  }
});

// Remove driver role; deletes record entirely if not also an admin
router.delete('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(400).send({ err: 'id not found in Employees' });
    }

    if (employee.isAdmin) {
      await prisma.employee.update({
        where: { id },
        data: { isDriver: false, availability: [] },
      });
    } else {
      await prisma.employee.delete({ where: { id } });
    }

    res.status(200).send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Employees' });
    }
    console.error('Error deleting driver:', error);
    res.status(500).send({ err: 'Failed to delete driver' });
  }
});

// Get a driver's weekly stats (stub)
router.get('/:id/stats', validateUser('Admin'), (req, res) => {});

export default router;
