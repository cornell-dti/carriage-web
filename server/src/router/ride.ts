import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as csv from '@fast-csv/format';
import moment from 'moment-timezone';
import { ObjectType } from 'dynamoose/dist/General';
import * as db from './common';
import { Ride, Status, Type, RideType, SchedulingState } from '../models/ride';
import { Tag, LocationType } from '../models/location';
import { validateUser, daysUntilWeekday } from '../util';
import { DriverType } from '../models/driver';
import { RiderType } from '../models/rider';
import { notify } from '../util/notification';
import { Change } from '../util/types';
import { UserType } from '../models/subscription';
import { sendRideEmails } from '../util/rideEmailService';

const router = express.Router();
const tableName = 'Rides';

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
    Ride.scan(new Condition()).exec(async (err, data) => {
      if (err) {
        res.status(500).send({ err: err.message });
        return;
      }
      const items = data || [];
      const bad: any[] = [];
      const goodIds: string[] = [];
      for (const item of items) {
        if (!item) continue;
        let id: string | undefined = undefined;
        try {
          id =
            (item as any).id || ((item as any).get && (item as any).get('id'));
        } catch (e) {
          // Ignore error when getting item ID
        }
        try {
          const populated = await (item as any).populate();
          if (id) goodIds.push(id);
        } catch (e: any) {
          bad.push({ id, error: e?.message || String(e) });
        }
      }
      res
        .status(200)
        .send({ total: items.length, goodCount: goodIds.length, bad });
    });
  } catch (e: any) {
    res.status(500).send({ err: e?.message || 'diagnostic failed' });
  }
});

router.get('/download', (req, res) => {
  const dateStart = moment(req.query.date as string).toISOString();
  const dateEnd = moment(req.query.date as string)
    .endOf('day')
    .toISOString();
  const condition = new Condition()
    .where('startTime')
    .between(dateStart, dateEnd)
    .where('status')
    .not()
    .eq(Status.CANCELLED);

  const callback = (value: any) => {
    const dataToExport = value
      .sort((a: any, b: any) => moment(a.startTime).diff(moment(b.startTime)))
      .flatMap((doc: any) => {
        const start = moment(doc.startTime);
        const end = moment(doc.endTime);
        const fullName = (user: RiderType | DriverType) =>
          `${user.firstName} ${user.lastName.substring(0, 1)}.`;

        // Handle multiple riders - create a row for each rider
        const ridersToProcess = doc.riders || [];
        if (ridersToProcess.length === 0) {
          // No riders assigned
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
    csv
      .writeToBuffer(dataToExport, { headers: true })
      .then((data) => res.send(data))
      .catch((err) => res.send(err));
  };
  db.scan(res, Ride, condition, callback);
});

// Get and query all master repeating rides in table
router.get('/repeating', validateUser('User'), (req, res) => {
  const {
    query: { rider },
  } = req;
  const now = moment().format('YYYY-MM-DD');
  const condition = new Condition('recurring')
    .eq(true)
    .where('endDate')
    .ge(now)
    .where('status')
    .not()
    .eq(Status.CANCELLED);

  if (rider) {
    // If rider filter is specified, use callback to filter after scan
    db.scan(res, Ride, condition, (data: RideType[]) => {
      // Filter for rides that include this rider
      const riderRides = data.filter((ride) => {
        // Check both old (rider) and new (riders) format for compatibility
        if (ride.riders && Array.isArray(ride.riders)) {
          return ride.riders.some((riderObj) => riderObj.id === rider);
        }
        // Legacy support for old rider field (if it exists)
        if ((ride as any).rider && (ride as any).rider.id === rider) {
          return true;
        }
        return false;
      });
      res.status(200).send({ data: riderRides });
    });
  } else {
    // No rider filter, can use direct scan
    db.scan(res, Ride, condition);
  }
});

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Ride, id, tableName);
});

// Get all rides for a rider by Rider ID
router.get('/rider/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  // Scan all rides and filter in JavaScript to avoid Dynamoose array condition issues
  db.scan(res, Ride, new Condition(), (data: RideType[]) => {
    // Filter for rides that include this rider
    const riderRides = data.filter((ride) => {
      // Check both old (rider) and new (riders) format for compatibility
      if (ride.riders && Array.isArray(ride.riders)) {
        return ride.riders.some((rider) => rider.id === id);
      }
      // Legacy support for old rider field (if it exists)
      if ((ride as any).rider && (ride as any).rider.id === id) {
        return true;
      }
      return false;
    });
    res.status(200).send({ data: riderRides });
  });
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
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
  let condition = new Condition('status').not().eq(Status.CANCELLED);

  if (type) {
    condition = condition.where('type').eq(type);
  } else if (scheduled) {
    // Legacy support: scheduled=true means not unscheduled
    condition = condition
      .where('schedulingState')
      .eq(SchedulingState.SCHEDULED);
  }

  // New schedulingState filter
  if (schedulingState) {
    condition = condition.where('schedulingState').eq(schedulingState);
  }

  if (status) {
    condition = condition.where('status').eq(status);
  }

  // Skip rider condition in Dynamoose query - will filter in JavaScript

  if (driver) {
    condition = condition.where('driver').eq(driver);
  }

  // Only apply date filter if date is provided and allDates is not true
  if (date && allDates !== 'true') {
    const dateStart = moment(date as string).toISOString();
    const dateEnd = moment(date as string)
      .endOf('day')
      .toISOString();
    condition = condition.where('startTime').between(dateStart, dateEnd);
  }

  if (rider) {
    // If rider filter is specified, use callback to filter after scan
    db.scan(res, Ride, condition, (data: RideType[]) => {
      // Filter for rides that include this rider
      const riderRides = data.filter((ride) => {
        // Check both old (rider) and new (riders) format for compatibility
        if (ride.riders && Array.isArray(ride.riders)) {
          return ride.riders.some((riderObj) => riderObj.id === rider);
        }
        // Legacy support for old rider field (if it exists)
        if ((ride as any).rider && (ride as any).rider.id === rider) {
          return true;
        }
        return false;
      });
      res.status(200).send({ data: riderRides });
    });
  } else {
    // No rider filter, can use direct scan
    db.scan(res, Ride, condition);
  }
});

// Diagnostic endpoint to find corrupted rides that fail populate
router.get('/diagnose', async (_req, res) => {
  try {
    Ride.scan(new Condition()).exec(async (err, data) => {
      if (err) {
        res.status(500).send({ err: err.message });
        return;
      }
      const items = data || [];
      const bad: any[] = [];
      const goodIds: string[] = [];
      for (const item of items) {
        if (!item) continue;
        let id: string | undefined = undefined;
        try {
          id =
            (item as any).id || ((item as any).get && (item as any).get('id'));
        } catch (e) {
          // Ignore error when getting item ID
        }
        try {
          const populated = await (item as any).populate();
          if (id) goodIds.push(id);
        } catch (e: any) {
          bad.push({ id, error: e?.message || String(e) });
        }
      }
      res
        .status(200)
        .send({ total: items.length, goodCount: goodIds.length, bad });
    });
  } catch (e: any) {
    res.status(500).send({ err: e?.message || 'diagnostic failed' });
  }
});

// Create a new ride
router.post('/', validateUser('User'), (req, res) => {
  const { body } = req;
  const {
    startLocation,
    endLocation,
    isRecurring = false,
    // Legacy support
    recurring,
  } = body;

  // Process locations - convert to reference IDs for storage
  const startLocationObj = startLocation as LocationType;
  const endLocationObj = endLocation as LocationType;

  // For now, only support single rides (isRecurring = false)
  if (isRecurring || recurring) {
    res.status(400).send({
      err: 'Recurring rides are not yet supported. Please create a single ride.',
    });
    return;
  }

  // Validate single ride requirements - support both legacy rider and new riders array
  const hasRiders = body.riders && body.riders.length > 0;
  const hasLegacyRider = body.rider;

  if (!body.startTime || !body.endTime || (!hasRiders && !hasLegacyRider)) {
    res.status(400).send({
      err: 'Missing required fields: startTime, endTime, and at least one rider are required for single rides.',
    });
    return;
  }

  // Validate that startTime is in the future
  const startTime = new Date(body.startTime);
  const now = new Date();
  if (startTime <= now) {
    res.status(400).send({
      err: 'Start time must be in the future.',
    });
    return;
  }

  // Validate that endTime is after startTime
  const endTime = new Date(body.endTime);
  if (endTime <= startTime) {
    res.status(400).send({
      err: 'End time must be after start time.',
    });
    return;
  }

  // Determine scheduling state based on driver assignment
  const hasDriver = body.driver ? true : false;
  const schedulingState =
    body.schedulingState ||
    (hasDriver ? SchedulingState.SCHEDULED : SchedulingState.UNSCHEDULED);

  // Determine riders array - support both new format and legacy format
  let ridersArray;
  if (body.riders && body.riders.length > 0) {
    ridersArray = body.riders;
  } else if (body.rider) {
    // Convert legacy single rider to array
    ridersArray = [body.rider];
  } else {
    ridersArray = [];
  }

  // Process riders - convert to IDs only for database storage (same logic as PUT route)
  if (ridersArray && Array.isArray(ridersArray)) {
    ridersArray = ridersArray.map((rider: any) =>
      typeof rider === 'string' ? rider : rider.id
    );
  }

  // Create single ride
  const ride = new Ride({
    id: uuid(),
    startLocation: startLocationObj,
    endLocation: endLocationObj,
    startTime: body.startTime,
    endTime: body.endTime,
    riders: ridersArray,
    driver: body.driver || undefined,
    type: body.type || Type.UPCOMING,
    status: body.status || Status.NOT_STARTED,
    schedulingState: schedulingState,
    isRecurring: false,
    timezone: body.timezone || 'America/New_York',
  });

  db.create(res, ride, async (doc) => {
    const createdRide = doc as RideType;
    const { userType } = res.locals.user;
    
    // Send emails if needed (for scheduled, rejected, cancelled)
    sendRideEmails(createdRide).catch((error) => {
      console.error('Failed to send ride emails:', error);
    });
    
    // Send notification
    notify(createdRide, body, userType, Change.CREATED)
      .then(() => res.send(createdRide))
      .catch(() => res.send(createdRide));
  });
});

// Update an existing ride
router.put('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  const { type, startLocation, endLocation } = body;

  if (
    type &&
    type === Type.UPCOMING &&
    body.schedulingState === SchedulingState.UNSCHEDULED
  ) {
    body.$REMOVE = ['driver'];
  }

  // Auto-update schedulingState based on driver assignment
  if (body.driver) {
    // If driver is being assigned, mark as scheduled
    body.schedulingState = SchedulingState.SCHEDULED;
  } else if (body.$REMOVE && body.$REMOVE.includes('driver')) {
    // If driver is being removed, mark as unscheduled
    body.schedulingState = SchedulingState.UNSCHEDULED;
  } else if (
    Object.prototype.hasOwnProperty.call(body, 'driver') &&
    !body.driver
  ) {
    // If driver is explicitly set to null/undefined, mark as unscheduled
    body.schedulingState = SchedulingState.UNSCHEDULED;
  }

  // Process riders - convert to IDs only for database storage
  if (body.riders && Array.isArray(body.riders)) {
    body.riders = body.riders.map((rider: any) =>
      typeof rider === 'string' ? rider : rider.id
    );
  }

  //Check if id matches or user is admin
  db.getById(res, Ride, id, tableName, (originalRide: RideType) => {
    const { riders, driver } = originalRide;
    const userIsRider =
      riders && riders.some((rider) => rider.id === res.locals.user.id);

    if (
      res.locals.user.userType === UserType.ADMIN ||
      userIsRider ||
      (driver && res.locals.user.id === driver.id)
    ) {
      // Detect if ride is being modified (has driver and time/location changed)
      const rideHasDriver = originalRide.driver && originalRide.driver.id;
      const willHaveDriver = body.driver || (!body.$REMOVE?.includes('driver') && rideHasDriver);
      
      // Check if time, pickup, or dropoff changed
      const timeChanged = body.startTime && 
        new Date(body.startTime).getTime() !== new Date(originalRide.startTime).getTime();
      const pickupChanged = body.startLocation && 
        (typeof body.startLocation === 'string' 
          ? body.startLocation !== originalRide.startLocation?.id
          : body.startLocation.id !== originalRide.startLocation?.id);
      const dropoffChanged = body.endLocation && 
        (typeof body.endLocation === 'string'
          ? body.endLocation !== originalRide.endLocation?.id
          : body.endLocation.id !== originalRide.endLocation?.id);
      
      const isModified = (timeChanged || pickupChanged || dropoffChanged) && 
                         rideHasDriver && 
                         willHaveDriver;

      // If ride is being modified and has/will have a driver, override to SCHEDULED_WITH_MODIFICATION
      // (This overrides the SCHEDULED state that was set earlier based on driver assignment)
      if (isModified && (!body.schedulingState || body.schedulingState === SchedulingState.SCHEDULED)) {
        body.schedulingState = SchedulingState.SCHEDULED_WITH_MODIFICATION;
      }

      db.update(res, Ride, { id }, body, tableName, async (doc) => {
        const updatedRide = doc as RideType;
        const { userType } = res.locals.user;
        
        // Send emails if needed (for scheduled, rejected, cancelled, or modified)
        sendRideEmails(updatedRide, originalRide).catch((error) => {
          console.error('Failed to send ride emails:', error);
        });
        
        // send ride even if notification failed since it was actually updated
        notify(updatedRide, body, userType)
          .then(() => res.send(updatedRide))
          .catch(() => res.send(updatedRide));
      });
    } else {
      res.status(400).send({
        err: 'User ID does not match request ID and user is not an admin.',
      });
    }
  });
});

// Recurring ride edits - disabled until recurring rides are implemented
router.put('/:id/edits', validateUser('User'), (req, res) => {
  res.status(400).send({
    err: 'Recurring ride edits are not supported yet. Only single rides are currently supported.',
  });
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Ride, id, tableName, (ride) => {
    const { isRecurring, riders, driver } = ride;

    // For now, block deletion of recurring rides
    if (isRecurring) {
      res.status(400).send({
        err: 'Recurring ride deletion not supported yet. Only single rides can be deleted.',
      });
      return;
    }

    // Check if user has permission to cancel/delete this ride
    const userIsRider =
      riders && riders.some((rider: any) => rider.id === res.locals.user.id);
    const userIsDriver = driver && res.locals.user.id === driver.id;
    const userIsAdmin = res.locals.user.userType === 'Admin';

    if (!userIsAdmin && !userIsRider && !userIsDriver) {
      res.status(403).send({
        err: 'You do not have permission to cancel this ride.',
      });
      return;
    }

    // Check constraints based on user type and ride status
    if (!userIsAdmin) {
      // Riders can only cancel rides that haven't started
      if (userIsRider && ride.status !== Status.NOT_STARTED) {
        res.status(400).send({
          err: 'You can only cancel rides that have not started yet.',
        });
        return;
      }

      // Drivers cannot cancel rides (only admins can)
      if (userIsDriver && !userIsRider) {
        res.status(400).send({
          err: 'Drivers cannot cancel rides. Please contact an admin.',
        });
        return;
      }
    }

    // Admin can cancel any ride, but check if it's already completed/past
    if (ride.status === Status.COMPLETED) {
      res.status(400).send({
        err: 'Cannot cancel a ride that has already been completed.',
      });
      return;
    }

    // If ride has no driver (unscheduled ride)
    if (!ride.driver) {
      // Only admins can reject unscheduled rides (set schedulingState to REJECTED)
      if (userIsAdmin) {
        db.update(res, Ride, { id }, { schedulingState: SchedulingState.REJECTED }, tableName, async (doc) => {
          const updatedRide = doc as RideType;
          const { userType } = res.locals.user;
          
          // Send emails for rejected ride
          sendRideEmails(updatedRide).catch((error) => {
            console.error('Failed to send ride rejection emails:', error);
          });
          
          // Send notification (if still needed for other purposes)
          notify(updatedRide, { schedulingState: SchedulingState.REJECTED }, userType)
            .then(() => res.send(updatedRide))
            .catch(() => res.send(updatedRide));
        });
        return;
      }
      
      // Riders can cancel their own unscheduled ride requests
      // For unscheduled rides, we'll physically delete them since they haven't been scheduled yet
      if (userIsRider) {
        db.deleteById(res, Ride, id, tableName);
        return;
      }
      
      // If user is neither admin nor rider, they can't cancel unscheduled rides
      res.status(403).send({
        err: 'You do not have permission to cancel this ride.',
      });
      return;
    }

    // If ride has a driver (scheduled ride), set status to CANCELLED instead of deleting
    db.update(res, Ride, { id }, { status: Status.CANCELLED }, tableName, async (doc) => {
      const updatedRide = doc as RideType;
      const { userType } = res.locals.user;
      
      // Send emails for cancelled ride
      sendRideEmails(updatedRide).catch((error) => {
        console.error('Failed to send ride cancellation emails:', error);
      });
      
      // Send cancellation notification
      try {
        await notify(updatedRide, { status: Status.CANCELLED }, userType, Change.CANCELLED);
      } catch (notificationError) {
        console.error(
          'Failed to send cancellation notification:',
          notificationError
        );
      }
      res.send(updatedRide);
    });
  });
});

export default router;
