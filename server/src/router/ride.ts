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

const router = express.Router();
const tableName = 'Rides';

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
      .map((doc: any) => {
        const start = moment(doc.startTime);
        const end = moment(doc.endTime);
        const fullName = (user: RiderType | DriverType) =>
          `${user.firstName} ${user.lastName.substring(0, 1)}.`;
        return {
          Name: fullName(doc.rider),
          'Pick Up': start.format('h:mm A'),
          From: doc.startLocation.name,
          To: doc.endLocation.name,
          'Drop Off': end.format('h:mm A'),
          Needs: doc.rider.accessibility,
          Driver: doc.driver ? fullName(doc.driver) : '',
        };
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
  let condition = new Condition('recurring')
    .eq(true)
    .where('endDate')
    .ge(now)
    .where('status')
    .not()
    .eq(Status.CANCELLED);
  if (rider) {
    condition = condition.where('rider').eq(rider);
  }
  db.scan(res, Ride, condition);
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
  const condition = new Condition('rider').eq(id);
  db.scan(res, Ride, condition);
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { type, status, rider, driver, date, scheduled, schedulingState } = req.query;
  let condition = new Condition('status').not().eq(Status.CANCELLED);
  
  if (type) {
    condition = condition.where('type').eq(type);
  } else if (scheduled) {
    // Legacy support: scheduled=true means not unscheduled
    condition = condition.where('type').not().eq(Type.UNSCHEDULED);
  }
  
  // New schedulingState filter
  if (schedulingState) {
    condition = condition.where('schedulingState').eq(schedulingState);
  }
  
  if (status) {
    condition = condition.where('status').eq(status);
  }
  if (rider) {
    condition = condition.where('rider').eq(rider);
  }
  if (driver) {
    condition = condition.where('driver').eq(driver);
  }
  if (date) {
    const dateStart = moment(date as string).toISOString();
    const dateEnd = moment(date as string)
      .endOf('day')
      .toISOString();
    condition = condition.where('startTime').between(dateStart, dateEnd);
  }
  db.scan(res, Ride, condition);
});

// Create a new ride
router.post('/', validateUser('User'), (req, res) => {
  const { body } = req;
  const { 
    startLocation, 
    endLocation, 
    isRecurring = false,
    // Legacy support 
    recurring 
  } = body;

  // Process locations - both startLocation and endLocation are always objects
  const startLocationObj = startLocation as LocationType;
  const endLocationObj = endLocation as LocationType;

  // For now, only support single rides (isRecurring = false)
  if (isRecurring || recurring) {
    res.status(400).send({ 
      err: 'Recurring rides are not yet supported. Please create a single ride.' 
    });
    return;
  }

  // Validate single ride requirements
  if (!body.startTime || !body.endTime || !body.rider) {
    res.status(400).send({ 
      err: 'Missing required fields: startTime, endTime, and rider are required for single rides.' 
    });
    return;
  }

  // Validate that startTime is in the future
  const startTime = new Date(body.startTime);
  const now = new Date();
  if (startTime <= now) {
    res.status(400).send({ 
      err: 'Start time must be in the future.' 
    });
    return;
  }

  // Validate that endTime is after startTime
  const endTime = new Date(body.endTime);
  if (endTime <= startTime) {
    res.status(400).send({ 
      err: 'End time must be after start time.' 
    });
    return;
  }

  // Create single ride
  const ride = new Ride({
    id: uuid(),
    startLocation: startLocationObj,
    endLocation: endLocationObj,
    startTime: body.startTime,
    endTime: body.endTime,
    rider: body.rider,
    driver: body.driver || undefined,
    type: body.type || Type.UNSCHEDULED,
    status: body.status || Status.NOT_STARTED,
    schedulingState: body.schedulingState || SchedulingState.UNSCHEDULED,
    isRecurring: false,
    timezone: body.timezone || 'America/New_York',
  });

  db.create(res, ride, async (doc) => {
    const createdRide = doc as RideType;
    const { userType } = res.locals.user;
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

  if (type && type === Type.UNSCHEDULED) {
    body.$REMOVE = ['driver'];
  }

  // Locations are always objects, no processing needed

  //Check if id matches or user is admin
  db.getById(res, Ride, id, tableName, (ride: RideType) => {
    const { rider, driver } = ride;
    if (
      res.locals.user.userType === UserType.ADMIN ||
      res.locals.user.id == rider.id ||
      (driver && res.locals.user.id === driver.id)
    ) {
      db.update(res, Ride, { id }, body, tableName, async (doc) => {
        const ride = doc;
        const { userType } = res.locals.user;
        // send ride even if notification failed since it was actually updated
        notify(ride, body, userType)
          .then(() => res.send(ride))
          .catch(() => res.send(ride));
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
    err: 'Recurring ride edits are not supported yet. Only single rides are currently supported.' 
  });
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Ride, id, tableName, (ride) => {
    const { isRecurring, type } = ride;
    
    // For now, block deletion of recurring rides
    if (isRecurring) {
      res.status(400).send({ 
        err: 'Recurring ride deletion not supported yet. Only single rides can be deleted.' 
      });
      return;
    }
    
    if (type === Type.ACTIVE) {
      // Cancel active rides instead of deleting
      const operation = { status: Status.CANCELLED };
      db.update(res, Ride, { id }, operation, tableName, async (doc) => {
        const deletedRide = doc;
        const { userType } = res.locals.user;
        deletedRide.startLocation = ride.startLocation;
        deletedRide.endLocation = ride.endLocation;
        notify(deletedRide, operation, userType)
          .then(() => res.send(doc))
          .catch(() => res.send(doc));
      });
    } else {
      // Delete non-active single rides
      Ride.delete(id)
        .then(() => res.send({ id }))
        .catch((err) => res.status(500).send({ err: err.message }));
    }
  });
});

export default router;
