import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as csv from '@fast-csv/format';
import moment from 'moment-timezone';
import { ObjectType } from 'dynamoose/dist/General';
import * as db from './common';
import { Ride, Status, RideLocation, Type, RideType } from '../models/ride';
import { Tag } from '../models/location';
import { validateUser, daysUntilWeekday, getRideLocation } from '../util';
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

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { type, status, rider, driver, date, scheduled } = req.query;
  let condition = new Condition('status').not().eq(Status.CANCELLED);
  if (type) {
    condition = condition.where('type').eq(type);
  } else if (scheduled) {
    condition = condition.where('type').not().eq(Type.UNSCHEDULED);
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

// Put a ride in Rides table
router.post('/', validateUser('User'), (req, res) => {
  const { body } = req;
  const { startLocation, endLocation, recurring, recurringDays, endDate } =
    body;

  let startLocationObj: RideLocation | undefined;
  let endLocationObj: RideLocation | undefined;

  if (!validate(startLocation)) {
    const name = startLocation.split(',')[0];
    startLocationObj = {
      name,
      address: startLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (!validate(endLocation)) {
    const name = endLocation.split(',')[0];
    endLocationObj = {
      name,
      address: endLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (recurring && !(recurringDays && endDate)) {
    res.status(400).send({ err: 'Invalid repeating ride.' });
  } else {
    const ride = new Ride({
      ...body,
      id: uuid(),
      startLocation: startLocationObj ?? startLocation,
      endLocation: endLocationObj ?? endLocation,
      edits: recurring ? [] : undefined,
      deleted: recurring ? [] : undefined,
    });
    db.create(res, ride, async (doc) => {
      const ride = doc as RideType;
      const { userType } = res.locals.user;
      ride.startLocation = await getRideLocation(ride.startLocation);
      ride.endLocation = await getRideLocation(ride.endLocation);
      // send ride even if notification failed since it was actually updated
      notify(ride, body, userType, Change.CREATED)
        .then(() => res.send(ride))
        .catch(() => res.send(ride));
    });
  }
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

  if (startLocation && !validate(startLocation)) {
    const name = startLocation.split(',')[0];
    body.startLocation = {
      name,
      address: startLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (endLocation && !validate(endLocation)) {
    const name = endLocation.split(',')[0];
    body.endLocation = {
      name,
      address: endLocation,
      tag: Tag.CUSTOM,
    };
  }

  //Check if id matches or user is admin
  db.getById(res, Ride, id, tableName, (ride: RideType) => {
    const { rider, driver } = ride;
    if (
      res.locals.user.userType === UserType.ADMIN ||
      res.locals.user.id == rider ||
      (driver && res.locals.user.id === driver)
    ) {
      db.update(res, Ride, { id }, body, tableName, async (doc) => {
        const ride = doc;
        const { userType } = res.locals.user;
        ride.startLocation = await getRideLocation(ride.startLocation);
        ride.endLocation = await getRideLocation(ride.endLocation);
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

// Create edit instances and update a repeating ride's edits field
router.put('/:id/edits', validateUser('User'), (req, res) => {
  const {
    params: { id },
    body: {
      deleteOnly,
      origDate,
      startTime,
      endTime,
      startLocation,
      endLocation,
    },
  } = req;

  db.getById(res, Ride, id, tableName, (masterRide: RideType) => {
    const masterStartDate = moment(masterRide.startTime).format('YYYY-MM-DD');
    const origStartTimeOnly = moment(masterRide.startTime).format('HH:mm:ss');
    const origStartTime = moment(
      `${origDate}T${origStartTimeOnly}`
    ).toISOString();

    const origEndTimeOnly = moment(masterRide.endTime).format('HH:mm:ss');
    const origEndTime = moment(`${origDate}T${origEndTimeOnly}`).toISOString();

    const handleEdit = (change: any) => (ride: RideType) => {
      const { userType } = res.locals.user;

      // if deleteOnly = false, create a replace edit with the new fields
      if (!deleteOnly) {
        const replaceId = uuid();
        let startLocationObj: RideLocation | undefined;
        let endLocationObj: RideLocation | undefined;
        if (startLocation && !validate(startLocation)) {
          const name = startLocation.split(',')[0];
          startLocationObj = {
            name,
            address: startLocation,
            tag: Tag.CUSTOM,
          };
        }
        if (endLocation && !validate(endLocation)) {
          const name = endLocation.split(',')[0];
          endLocationObj = {
            name,
            address: endLocation,
            tag: Tag.CUSTOM,
          };
        }
        const replaceRide = new Ride({
          id: replaceId,
          rider: masterRide.rider,
          startLocation:
            startLocationObj ||
            startLocation ||
            masterRide.startLocation.id ||
            masterRide.startLocation,
          endLocation:
            endLocationObj ||
            endLocation ||
            masterRide.endLocation.id ||
            masterRide.endLocation,
          startTime: startTime || origStartTime,
          endTime: endTime || origEndTime,
        });
        const addEditOperation = { $ADD: { edits: [replaceId] } };
        // create replace edit and add replaceId to edits field
        db.create(res, replaceRide, (editRide) => {
          db.update(res, Ride, { id }, addEditOperation, tableName, () => {
            notify(editRide, change, userType, Change.REPEATING_EDITED)
              .then(() => res.send(editRide))
              .catch(() => res.send(editRide));
            // res.send(editRide);
          });
        });
      } else {
        res.send(ride);
      }
    };

    if (origDate > masterStartDate) {
      // add origDate to masterRide.deleted
      const addDeleteOperation = { $ADD: { deleted: [origDate] } };
      db.update(
        res,
        Ride,
        { id },
        addDeleteOperation,
        tableName,
        handleEdit(addDeleteOperation)
      );
    } else if (origDate === masterStartDate) {
      // move master repeating ride start and end to next occurrence
      const momentStart = moment(masterRide.startTime);
      const momentEnd = moment(masterRide.endTime);
      const nextRideDays = masterRide.recurringDays!.reduce(
        (acc, curr) => Math.min(acc, daysUntilWeekday(momentStart, curr)),
        8
      );
      const newStartTime = momentStart.add(nextRideDays, 'day');
      const newEndTime = momentEnd.add(nextRideDays, 'day');
      if (newStartTime.isAfter(moment(masterRide.endDate), 'day')) {
        // Shouldn't happen, but just in case
        db.deleteById(res, Ride, { id }, tableName);
      } else {
        const update: ObjectType = {
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        };
        if (newStartTime.isSame(moment(masterRide.endDate), 'day')) {
          update.recurring = false;
          update.$REMOVE = ['recurringDays', 'deleted', 'edits', 'endDate'];
        }
        db.update(res, Ride, { id }, update, tableName, handleEdit(update));
      }
    } else {
      res.status(400).send({ err: 'Invalid operation' });
    }
  });
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Ride, id, tableName, (ride) => {
    const { recurring, type } = ride;
    if (type === Type.ACTIVE) {
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
    } else if (type === Type.PAST && recurring) {
      const operation = {
        recurring: false,
        $REMOVE: ['recurringDays', 'deleted', 'edits', 'endDate'],
      };
      db.update(res, Ride, { id }, operation, tableName);
    } else {
      Ride.delete(id)
        .then(() => res.send({ id }))
        .catch((err) => res.status(500).send({ err: err.message }));
    }
  });
});

export default router;
