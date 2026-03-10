import express from 'express';
import { v4 as uuid } from 'uuid';
import * as csv from '@fast-csv/format';
import moment from 'moment-timezone';
import { prisma } from '../db/prisma';
import { RideType, RideStatus, SchedulingState } from '../../generated/prisma/client';
import { Status, Type } from '@carriage-web/shared/types/ride';
import { validateUser } from '../util';
import { DriverType } from '@carriage-web/shared/types/driver';
import { RiderType } from '@carriage-web/shared/types/rider';
import { notify } from '../util/notification';
import { Change } from '@carriage-web/shared/types';

const router = express.Router();

// Debug endpoint to get current user's JWT token
router.get('/debug/token', validateUser('User'), (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  res.json({
    token: token,
    user: res.locals.user,
  });
});

// Diagnostic endpoint to find corrupted rides that fail populate
router.get('/diagnose', async (_req, res) => {
  try {
    const rides = await prisma.ride.findMany();
    res.status(200).send({ total: rides.length, goodCount: rides.length, bad: [] });
  } catch (e: any) {
    res.status(500).send({ err: e?.message || 'diagnostic failed' });
  }
});

router.get('/download', async (req, res) => {
  try {
    const dateStart = moment(req.query.date as string).toDate();
    const dateEnd = moment(req.query.date as string).endOf('day').toDate();

    const rides = await prisma.ride.findMany({
      where: {
        startTime: { gte: dateStart, lte: dateEnd },
        status: { not: RideStatus.CANCELLED },
      },
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const dataToExport = rides.flatMap((doc: any) => {
      const start = moment(doc.startTime);
      const end = moment(doc.endTime);
      const fullName = (user: RiderType | DriverType) =>
        `${user.firstName} ${user.lastName.substring(0, 1)}.`;

      const ridersToProcess = doc.riders || [];
      if (ridersToProcess.length === 0) {
        return [
          {
            Name: 'No rider assigned',
            'Pick Up': start.format('h:mm A'),
            From: doc.startLocation.name,
            To: doc.endLocation.name,
            'Drop Off': end.format('h:mm A'),
            Needs: 'None',
            Driver: doc.driver ? fullName(doc.driver) : '',
          },
        ];
      }

      return ridersToProcess.map((rider: RiderType) => ({
        Name: fullName(rider),
        'Pick Up': start.format('h:mm A'),
        From: doc.startLocation.name,
        To: doc.endLocation.name,
        'Drop Off': end.format('h:mm A'),
        Needs:
          rider.accessibility && rider.accessibility.length > 0
            ? rider.accessibility.join(', ')
            : 'None',
        Driver: doc.driver ? fullName(doc.driver) : '',
      }));
    });

    const csvData = await csv.writeToBuffer(dataToExport, { headers: true });
    res.send(csvData);
  } catch (error) {
    console.error('Error downloading rides:', error);
    res.status(500).send({ err: 'Failed to download rides' });
  }
});

// Get and query all master repeating rides in table
router.get('/repeating', validateUser('User'), async (req, res) => {
  try {
    const { rider } = req.query;
    const now = moment().format('YYYY-MM-DD');

    const where: any = {
      isRecurring: true,
      status: { not: RideStatus.CANCELLED },
    };

    if (rider) {
      where.riders = { some: { id: rider as string } };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });

    res.status(200).send({ data: rides });
  } catch (error) {
    console.error('Error fetching repeating rides:', error);
    res.status(500).send({ err: 'Failed to fetch repeating rides' });
  }
});

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });
    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }
    res.status(200).json({ data: ride });
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).send({ err: 'Failed to fetch ride' });
  }
});

// Get all rides for a rider by Rider ID
router.get('/rider/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const rides = await prisma.ride.findMany({
      where: { riders: { some: { id } } },
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });
    res.status(200).send({ data: rides });
  } catch (error) {
    console.error('Error fetching rider rides:', error);
    res.status(500).send({ err: 'Failed to fetch rider rides' });
  }
});

// Get and query all rides in table
router.get('/', validateUser('User'), async (req, res) => {
  try {
    const {
      type,
      status,
      rider,
      driver,
      date,
      scheduled,
      schedulingState,
      allDates,
    } = req.query;

    const where: any = {};

    if (type) {
      where.type = type as RideType;
    } else if (scheduled === 'true') {
      where.schedulingState = SchedulingState.SCHEDULED;
    }

    if (schedulingState) {
      where.schedulingState = schedulingState as SchedulingState;
    }

    if (status) {
      where.status = status as RideStatus;
    }

    if (rider) {
      where.riders = { some: { id: rider as string } };
    }

    if (driver) {
      where.driverId = driver as string;
    }

    if (date && allDates !== 'true') {
      const dateStart = moment(date as string).toDate();
      const dateEnd = moment(date as string).endOf('day').toDate();
      where.startTime = { gte: dateStart, lte: dateEnd };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });

    res.status(200).send({ data: rides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).send({ err: 'Failed to fetch rides' });
  }
});

// Create a new ride
router.post('/', validateUser('User'), async (req, res) => {
  try {
    const { body } = req;
    const {
      startLocation,
      endLocation,
      isRecurring = false,
      recurring,
    } = body;

    if (isRecurring || recurring) {
      return res.status(400).send({
        err: 'Recurring rides are not yet supported. Please create a single ride.',
      });
    }

    const hasRiders = body.riders && body.riders.length > 0;
    const hasLegacyRider = body.rider;

    if (!body.startTime || !body.endTime || (!hasRiders && !hasLegacyRider)) {
      return res.status(400).send({
        err: 'Missing required fields: startTime, endTime, and at least one rider are required for single rides.',
      });
    }

    const startTime = new Date(body.startTime);
    const now = new Date();
    if (startTime <= now) {
      return res.status(400).send({
        err: 'Start time must be in the future.',
      });
    }

    const endTime = new Date(body.endTime);
    if (endTime <= startTime) {
      return res.status(400).send({
        err: 'End time must be after start time.',
      });
    }

    const hasDriver = body.driver ? true : false;
    const schedulingState =
      body.schedulingState ||
      (hasDriver ? SchedulingState.SCHEDULED : SchedulingState.UNSCHEDULED);

    let riderIds;
    if (body.riders && body.riders.length > 0) {
      riderIds = body.riders.map((rider: any) =>
        typeof rider === 'string' ? rider : rider.id
      );
    } else if (body.rider) {
      riderIds = [typeof body.rider === 'string' ? body.rider : body.rider.id];
    } else {
      riderIds = [];
    }

    const startLocationId = typeof startLocation === 'string' ? startLocation : startLocation.id;
    const endLocationId = typeof endLocation === 'string' ? endLocation : endLocation.id;

    // Extract driver ID if driver is an object
    const driverId = body.driver
      ? (typeof body.driver === 'string' ? body.driver : body.driver.id)
      : null;

    const ride = await prisma.ride.create({
      data: {
        id: uuid(),
        startLocationId,
        endLocationId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        riders: { connect: riderIds.map((id: string) => ({ id })) },
        driverId,
        type: body.type ? (body.type.toUpperCase() as RideType) : RideType.UPCOMING,
        status: body.status ? (body.status.toUpperCase() as RideStatus) : RideStatus.NOT_STARTED,
        schedulingState,
        isRecurring: false,
        timezone: body.timezone || 'America/New_York',
      },
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });

    const { userType } = res.locals.user;
    notify(ride, body, userType, Change.CREATED)
      .then(() => res.send(ride))
      .catch(() => res.send(ride));
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).send({ err: 'Failed to create ride' });
  }
});

// Update an existing ride
router.put('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { riders: true, driver: true },
    });

    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }

    const userIsRider = ride.riders.some((rider) => rider.id === res.locals.user.id);
    const userIsDriver = ride.driver && res.locals.user.id === ride.driver.id;
    const userIsAdmin = res.locals.user.userType === 'Admin';

    if (!userIsAdmin && !userIsRider && !userIsDriver) {
      return res.status(400).send({
        err: 'User ID does not match request ID and user is not an admin.',
      });
    }

    const updateData: any = {};

    if (body.type) updateData.type = body.type as RideType;
    if (body.status) updateData.status = body.status as RideStatus;
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.timezone) updateData.timezone = body.timezone;

    if (body.startLocation) {
      updateData.startLocationId = typeof body.startLocation === 'string'
        ? body.startLocation
        : body.startLocation.id;
    }

    if (body.endLocation) {
      updateData.endLocationId = typeof body.endLocation === 'string'
        ? body.endLocation
        : body.endLocation.id;
    }

    if (body.riders && Array.isArray(body.riders)) {
      const riderIds = body.riders.map((rider: any) =>
        typeof rider === 'string' ? rider : rider.id
      );
      updateData.riders = { set: riderIds.map((id: string) => ({ id })) };
    }

    if (Object.prototype.hasOwnProperty.call(body, 'driver')) {
      if (body.driver) {
        updateData.driverId = typeof body.driver === 'string' ? body.driver : body.driver.id;
        updateData.schedulingState = SchedulingState.SCHEDULED;
      } else {
        updateData.driverId = null;
        updateData.schedulingState = SchedulingState.UNSCHEDULED;
      }
    }

    if (body.schedulingState) {
      updateData.schedulingState = body.schedulingState as SchedulingState;
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: updateData,
      include: {
        startLocation: true,
        endLocation: true,
        riders: true,
        driver: true,
      },
    });

    const { userType } = res.locals.user;
    notify(updatedRide, body, userType)
      .then(() => res.send(updatedRide))
      .catch(() => res.send(updatedRide));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Rides' });
    }
    console.error('Error updating ride:', error);
    res.status(500).send({ err: 'Failed to update ride' });
  }
});

// Recurring ride edits - disabled until recurring rides are implemented
router.put('/:id/edits', validateUser('User'), (req, res) => {
  res.status(400).send({
    err: 'Recurring ride edits are not supported yet. Only single rides are currently supported.',
  });
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { riders: true, driver: true },
    });

    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }

    if (ride.isRecurring) {
      return res.status(400).send({
        err: 'Recurring ride deletion not supported yet. Only single rides can be deleted.',
      });
    }

    const userIsRider = ride.riders.some((rider: any) => rider.id === res.locals.user.id);
    const userIsDriver = ride.driver && res.locals.user.id === ride.driver.id;
    const userIsAdmin = res.locals.user.userType === 'Admin';

    if (!userIsAdmin && !userIsRider && !userIsDriver) {
      return res.status(403).send({
        err: 'You do not have permission to cancel this ride.',
      });
    }

    if (!userIsAdmin) {
      if (userIsRider && ride.status !== RideStatus.NOT_STARTED) {
        return res.status(400).send({
          err: 'You can only cancel rides that have not started yet.',
        });
      }

      if (userIsDriver && !userIsRider) {
        return res.status(400).send({
          err: 'Drivers cannot cancel rides. Please contact an admin.',
        });
      }
    }

    if (ride.status === RideStatus.COMPLETED) {
      return res.status(400).send({
        err: 'Cannot cancel a ride that has already been completed.',
      });
    }

    await prisma.ride.delete({ where: { id } });

    const { userType } = res.locals.user;
    try {
      await notify(ride, {}, userType, Change.CANCELLED);
    } catch (notificationError) {
      console.error('Failed to send cancellation notification:', notificationError);
    }

    res.send({ id });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Rides' });
    }
    console.error('Error deleting ride:', error);
    res.status(500).send({ err: 'Failed to delete ride' });
  }
});

export default router;
