import express from 'express';
import { v4 as uuid } from 'uuid';
import * as csv from '@fast-csv/format';
import moment from 'moment-timezone';
import { prisma } from '../db/prisma';
import {
  RideType,
  RideStatus,
  SchedulingState,
} from '../../generated/prisma/client';
import { validateUser } from '../util';
import { DriverType } from '@carriage-web/shared/types/driver';
import { RiderType } from '@carriage-web/shared/types/rider';
import { notify } from '../util/notification';
import { Change } from '@carriage-web/shared/types';

const router = express.Router();

// ---------------------------------------------------------------------------
// Recurring-ride helpers
// ---------------------------------------------------------------------------

/**
 * Generate ride data objects for a recurring series.
 * Iterates day-by-day from the first occurrence's date through
 * min(recurrenceEndDate, now + 4 months), skipping past times.
 */
function generateRecurringRides(
  baseFields: any,
  recurrenceDays: number[],
  recurrenceEndDate: Date,
  timezone: string,
  recurrenceId: string
): any[] {
  const startMoment = moment.tz(baseFields.startTime, timezone);
  const endMoment = moment.tz(baseFields.endTime, timezone);
  const rideDuration = endMoment.diff(startMoment); // ms

  const maxDate = moment().tz(timezone).add(4, 'months').endOf('day');
  const seriesEnd = moment.tz(recurrenceEndDate, timezone).endOf('day');
  const endDate = seriesEnd.isBefore(maxDate) ? seriesEnd : maxDate;

  const rides: any[] = [];
  const current = startMoment.clone().startOf('day');

  while (current.isSameOrBefore(endDate, 'day')) {
    if (recurrenceDays.includes(current.day())) {
      const rideStart = current
        .clone()
        .hour(startMoment.hour())
        .minute(startMoment.minute())
        .second(startMoment.second())
        .millisecond(0);

      if (rideStart.isAfter(moment())) {
        const rideEnd = rideStart.clone().add(rideDuration, 'ms');
        rides.push({
          ...baseFields,
          id: uuid(),
          startTime: rideStart.toDate(),
          endTime: rideEnd.toDate(),
          recurrenceId,
          recurrenceDays,
          recurrenceEndDate,
          isRecurring: true,
        });
      }
    }
    current.add(1, 'day');
  }

  return rides;
}

// Transform Prisma ride (uppercase enums) to frontend-expected format (lowercase enums)
const formatRide = (ride: any) => ({
  ...ride,
  type: ride.type?.toLowerCase(),
  status: ride.status?.toLowerCase(),
  schedulingState: ride.schedulingState?.toLowerCase(),
});

// Build a Prisma update payload from request body fields.
// Used for single-ride edits — includes schedulingState since admins manage that per-ride.
// Do NOT use this for bulk future-ride regeneration.
function buildUpdateData(body: any): any {
  const updateData: any = {};

  if (body.type) updateData.type = body.type.toUpperCase() as RideType;
  if (body.status) updateData.status = body.status.toUpperCase() as RideStatus;
  if (body.startTime) updateData.startTime = new Date(body.startTime);
  if (body.endTime) updateData.endTime = new Date(body.endTime);
  if (body.timezone) updateData.timezone = body.timezone;
  if (body.recurrenceDays) updateData.recurrenceDays = body.recurrenceDays;
  if (body.recurrenceEndDate)
    updateData.recurrenceEndDate = new Date(body.recurrenceEndDate);

  if (body.startLocation) {
    updateData.startLocationId =
      typeof body.startLocation === 'string'
        ? body.startLocation
        : body.startLocation.id;
  }

  if (body.endLocation) {
    updateData.endLocationId =
      typeof body.endLocation === 'string'
        ? body.endLocation
        : body.endLocation.id;
  }

  if (body.riders && Array.isArray(body.riders)) {
    const riderIds = body.riders.map((r: any) =>
      typeof r === 'string' ? r : r.id
    );
    updateData.riders = { set: riderIds.map((id: string) => ({ id })) };
  }

  if (Object.prototype.hasOwnProperty.call(body, 'driver')) {
    if (body.driver) {
      updateData.driverId =
        typeof body.driver === 'string' ? body.driver : body.driver.id;
      updateData.schedulingState = SchedulingState.SCHEDULED;
    } else {
      updateData.driverId = null;
      updateData.schedulingState = SchedulingState.UNSCHEDULED;
    }
  }

  if (body.schedulingState) {
    updateData.schedulingState =
      body.schedulingState.toUpperCase() as SchedulingState;
  }

  return updateData;
}

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
    res
      .status(200)
      .send({ total: rides.length, goodCount: rides.length, bad: [] });
  } catch (e: any) {
    res.status(500).send({ err: e?.message || 'diagnostic failed' });
  }
});

router.get('/download', async (req, res) => {
  try {
    const dateStart = moment(req.query.date as string).toDate();
    const dateEnd = moment(req.query.date as string)
      .endOf('day')
      .toDate();

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

    res.status(200).send({ data: rides.map(formatRide) });
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
    res.status(200).json({ data: formatRide(ride) });
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
    res.status(200).send({ data: rides.map(formatRide) });
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
      const dateEnd = moment(date as string)
        .endOf('day')
        .toDate();
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

    res.status(200).send({ data: rides.map(formatRide) });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).send({ err: 'Failed to fetch rides' });
  }
});

// Create a new ride
router.post('/', validateUser('User'), async (req, res) => {
  try {
    const { body } = req;
    const { startLocation, endLocation, isRecurring = false, recurring } = body;

    if (isRecurring || recurring) {
      const { recurrenceDays, recurrenceEndDate } = body;
      const timezone = body.timezone || 'America/New_York';

      if (!recurrenceDays || !Array.isArray(recurrenceDays) || recurrenceDays.length === 0) {
        return res.status(400).send({
          err: 'recurrenceDays is required for recurring rides (array of 0–6, where 0=Sun).',
        });
      }
      if (!recurrenceEndDate) {
        return res.status(400).send({ err: 'recurrenceEndDate is required for recurring rides.' });
      }
      if (!body.startTime || !body.endTime) {
        return res.status(400).send({ err: 'startTime and endTime are required.' });
      }
      const maxEnd = moment().tz(timezone).add(4, 'months').endOf('day');
      if (moment.tz(recurrenceEndDate, timezone).isAfter(maxEnd)) {
        return res.status(400).send({
          err: 'Recurring rides can only be scheduled up to 4 months in advance.',
        });
      }

      const hasRiders = body.riders && body.riders.length > 0;
      const hasLegacyRider = body.rider;
      if (!hasRiders && !hasLegacyRider) {
        return res.status(400).send({ err: 'At least one rider is required.' });
      }

      const riderIds: string[] =
        hasRiders
          ? body.riders.map((r: any) => (typeof r === 'string' ? r : r.id))
          : [typeof body.rider === 'string' ? body.rider : body.rider.id];

      const startLocationId =
        typeof startLocation === 'string' ? startLocation : startLocation.id;
      const endLocationId =
        typeof endLocation === 'string' ? endLocation : endLocation.id;
      const driverId = body.driver
        ? typeof body.driver === 'string' ? body.driver : body.driver.id
        : null;
      const schedulingState: SchedulingState = driverId
        ? SchedulingState.SCHEDULED
        : SchedulingState.UNSCHEDULED;

      const recurrenceId = uuid();
      const ridesData = generateRecurringRides(
        { startTime: new Date(body.startTime), endTime: new Date(body.endTime) },
        recurrenceDays,
        new Date(recurrenceEndDate),
        timezone,
        recurrenceId
      );

      if (ridesData.length === 0) {
        return res.status(400).send({
          err: 'No future rides could be generated for the given recurrence pattern and date range.',
        });
      }

      await prisma.$transaction(
        ridesData.map((r) =>
          prisma.ride.create({
            data: {
              id: r.id,
              startTime: r.startTime,
              endTime: r.endTime,
              startLocationId,
              endLocationId,
              driverId,
              riders: { connect: riderIds.map((id) => ({ id })) },
              type: (body.type?.toUpperCase() ?? 'UPCOMING') as RideType,
              status: RideStatus.NOT_STARTED,
              schedulingState,
              timezone,
              isRecurring: true,
              recurrenceId,
              recurrenceDays,
              recurrenceEndDate: new Date(recurrenceEndDate),
            },
          })
        )
      );

      return res.status(200).send({ data: { recurrenceId, count: ridesData.length } });
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
    const schedulingState: SchedulingState =
      body.schedulingState === 'scheduled' ||
      body.schedulingState === SchedulingState.SCHEDULED
        ? SchedulingState.SCHEDULED
        : body.schedulingState === 'unscheduled' ||
          body.schedulingState === SchedulingState.UNSCHEDULED
        ? SchedulingState.UNSCHEDULED
        : hasDriver
        ? SchedulingState.SCHEDULED
        : SchedulingState.UNSCHEDULED;

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

    const startLocationId =
      typeof startLocation === 'string' ? startLocation : startLocation.id;
    const endLocationId =
      typeof endLocation === 'string' ? endLocation : endLocation.id;

    // Extract driver ID if driver is an object
    const driverId = body.driver
      ? typeof body.driver === 'string'
        ? body.driver
        : body.driver.id
      : null;

    // Verify all referenced records exist before creating the ride
    const [startLoc, endLoc, ...riders] = await Promise.all([
      prisma.location.findUnique({ where: { id: startLocationId } }),
      prisma.location.findUnique({ where: { id: endLocationId } }),
      ...riderIds.map((rid: string) =>
        prisma.rider.findUnique({ where: { id: rid } })
      ),
    ]);
    if (!startLoc)
      return res
        .status(400)
        .send({ err: `startLocation not found: ${startLocationId}` });
    if (!endLoc)
      return res
        .status(400)
        .send({ err: `endLocation not found: ${endLocationId}` });
    const missingRider = riderIds.find((_: string, i: number) => !riders[i]);
    if (missingRider)
      return res.status(400).send({ err: `rider not found: ${missingRider}` });

    const ride = await prisma.ride.create({
      data: {
        id: uuid(),
        startLocationId,
        endLocationId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        riders: { connect: riderIds.map((id: string) => ({ id })) },
        driverId,
        type: body.type
          ? (body.type.toUpperCase() as RideType)
          : RideType.UPCOMING,
        status: body.status
          ? (body.status.toUpperCase() as RideStatus)
          : RideStatus.NOT_STARTED,
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
    const formattedRide = formatRide(ride);
    notify(formattedRide as any, body as any, userType, Change.CREATED)
      .then(() => res.send({ data: formattedRide }))
      .catch(() => res.send({ data: formattedRide }));
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).send({ err: 'Failed to create ride' });
  }
});

// Update an existing ride
// ?scope=single (default) — detaches this ride from its series and updates only it
// ?scope=future           — deletes this + all future rides in the series and regenerates
//                           them with the new parameters (time, location, days, riders)
router.put('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const scope = (req.query.scope as string) || 'single';

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { riders: true, driver: true },
    });

    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }

    const userIsRider = ride.riders.some(
      (rider) => rider.id === res.locals.user.id
    );
    const userIsDriver = ride.driver && res.locals.user.id === ride.driver.id;
    const userIsAdmin = res.locals.user.userType === 'Admin';

    if (!userIsAdmin && !userIsRider && !userIsDriver) {
      return res.status(400).send({
        err: 'User ID does not match request ID and user is not an admin.',
      });
    }

    // --- edit all future rides in the series ---
    if (scope === 'future' && ride.recurrenceId) {
      const timezone = body.timezone ?? ride.timezone ?? 'America/New_York';
      const recurrenceDays: number[] = body.recurrenceDays ?? ride.recurrenceDays ?? [];
      const recurrenceEndDate = body.recurrenceEndDate
        ? new Date(body.recurrenceEndDate)
        : ride.recurrenceEndDate;

      if (!recurrenceEndDate) {
        return res.status(400).send({ err: 'recurrenceEndDate is missing from the series.' });
      }

      const startLocationId = body.startLocation
        ? typeof body.startLocation === 'string' ? body.startLocation : body.startLocation.id
        : ride.startLocationId;
      const endLocationId = body.endLocation
        ? typeof body.endLocation === 'string' ? body.endLocation : body.endLocation.id
        : ride.endLocationId;
      const driverId = Object.prototype.hasOwnProperty.call(body, 'driver')
        ? body.driver ? (typeof body.driver === 'string' ? body.driver : body.driver.id) : null
        : ride.driverId;
      const riderIds: string[] = body.riders
        ? body.riders.map((r: any) => (typeof r === 'string' ? r : r.id))
        : ride.riders.map((r) => r.id);
      const startTime = body.startTime ? new Date(body.startTime) : ride.startTime;
      const endTime = body.endTime ? new Date(body.endTime) : ride.endTime;

      // delete this ride and all future rides in the series
      await prisma.ride.deleteMany({
        where: { recurrenceId: ride.recurrenceId, startTime: { gte: ride.startTime } },
      });

      // regenerate from this point forward with the new parameters
      const ridesData = generateRecurringRides(
        { startTime, endTime },
        recurrenceDays,
        recurrenceEndDate,
        timezone,
        ride.recurrenceId
      );

      if (ridesData.length === 0) {
        return res.status(200).send({ data: { updated: 0 } });
      }

      // schedulingState is intentionally NOT carried over — admins manage that per-ride
      const schedulingState = driverId ? SchedulingState.SCHEDULED : SchedulingState.UNSCHEDULED;

      await prisma.$transaction(
        ridesData.map((r) =>
          prisma.ride.create({
            data: {
              id: r.id,
              startTime: r.startTime,
              endTime: r.endTime,
              startLocationId,
              endLocationId,
              driverId,
              riders: { connect: riderIds.map((rid) => ({ id: rid })) },
              type: (body.type?.toUpperCase() ?? ride.type) as RideType,
              status: RideStatus.NOT_STARTED,
              schedulingState,
              timezone,
              isRecurring: true,
              recurrenceId: ride.recurrenceId,
              recurrenceDays,
              recurrenceEndDate,
            },
          })
        )
      );

      return res.status(200).send({ data: { updated: ridesData.length } });
    }

    // --- single edit ---
    // If this ride belongs to a series, detach it so it becomes standalone
    const updateData = buildUpdateData(body);
    if (ride.recurrenceId) {
      updateData.recurrenceId = null;
      updateData.recurrenceDays = [];
      updateData.recurrenceEndDate = null;
      updateData.isRecurring = false;
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
    const formattedRide = formatRide(updatedRide);
    notify(formattedRide as any, body as any, userType)
      .then(() => res.send({ data: formattedRide }))
      .catch(() => res.send({ data: formattedRide }));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(400).send({ err: 'id not found in Rides' });
    }
    console.error('Error updating ride:', error);
    res.status(500).send({ err: 'Failed to update ride' });
  }
});


// Delete an existing ride
// ?scope=single (default) — delete only this ride
// ?scope=future           — delete this ride and all future rides in the series
router.delete('/:id', validateUser('User'), async (req, res) => {
  try {
    const { id } = req.params;
    const scope = (req.query.scope as string) || 'single';

    const ride = await prisma.ride.findUnique({
      where: { id },
      include: { riders: true, driver: true },
    });

    if (!ride) {
      return res.status(400).send({ err: 'id not found in Rides' });
    }

    const userIsRider = ride.riders.some(
      (rider: any) => rider.id === res.locals.user.id
    );
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

    // delete this ride and all future rides in the series
    if (scope === 'future' && ride.recurrenceId) {
      const { count } = await prisma.ride.deleteMany({
        where: { recurrenceId: ride.recurrenceId, startTime: { gte: ride.startTime } },
      });
      return res.status(200).send({ deleted: count });
    }

    // delete just this one
    await prisma.ride.delete({ where: { id } });

    const { userType } = res.locals.user;
    try {
      await notify(formatRide(ride) as any, {}, userType, Change.CANCELLED);
    } catch (notificationError) {
      console.error(
        'Failed to send cancellation notification:',
        notificationError
      );
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
