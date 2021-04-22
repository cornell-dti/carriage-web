import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import moment from 'moment';
import * as db from './common';
import { Rider, RiderType } from '../models/rider';
import { Location } from '../models/location';
import { createKeys, validateUser } from '../util';
import { Ride, RideType, Type, Status } from '../models/ride';

const router = express.Router();
const tableName = 'Riders';

// Get a rider by id in Riders table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName);
});

// Get all riders
router.get('/', validateUser('Admin'), (req, res) => {
  db.getAll(res, Rider, tableName);
});

// Get profile information for a rider
router.get('/:id/profile', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const {
      email, firstName, lastName, phoneNumber, pronouns, joinDate, endDate,
    } = rider;
    res.send({
      email, firstName, lastName, phoneNumber, pronouns, joinDate, endDate,
    });
  });
});

// Get accessibility information for a rider
router.get('/:id/accessibility', validateUser('User'), async (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const { description, accessibility } = rider;
    res.send({ description, accessibility });
  });
});

// Get organization information for a rider
router.get('/:id/organization', validateUser('User'), async (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, (rider: RiderType) => {
    const { description, organization } = rider;
    res.send({ description, organization });
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, ({ favoriteLocations }: RiderType) => {
    const keys = createKeys('id', favoriteLocations);
    db.batchGet(res, Location, keys, 'Locations');
  });
});

// Get current/soonest ride (within next 30 min) of rider, if exists
router.get('/:id/currentride', validateUser('Rider'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Rider, id, tableName, () => {
    const now = moment.tz('America/New_York').toISOString();
    const end = moment.tz('America/New_York').add(30, 'minutes').toISOString();
    const isRider = new Condition('rider').eq(id);
    const isActive = new Condition('type').eq(Type.ACTIVE);
    const isSoon = new Condition('startTime').between(now, end);
    const isNow = new Condition('startTime').le(now).where('endTime').ge(now);
    const condition = isRider.group(isActive.group(isSoon.or().group(isNow)));
    db.scan(res, Ride, condition, (data: RideType[]) => {
      data.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
      res.send(data[0] ?? {});
    });
  });
});

router.get('/:id/usage', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  let noShowCount: number;
  let studentRides: number;
  db.getById(res, Rider, id, tableName, () => {
    const isRider = new Condition('rider').eq(id);
    const isNoshow = new Condition('status').eq(Status.NO_SHOW);
    const conditionNoShow = isRider.group(isNoshow);
    const isCompleted = new Condition('status').eq(Status.COMPLETED);
    const conditionRides = isRider.group(isCompleted);
    db.scan(res, Ride, conditionNoShow, (data: RideType[]) => {
      noShowCount = data.length;
      db.scan(res, Ride, conditionRides, (data_: RiderType[]) => {
        studentRides = data_.length;
        res.send({ studentRides, noShowCount });
      });
    });
  });
});

// Create a rider in Riders table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;
  const rider = new Rider({
    ...body,
    id: uuid(),
  });
  db.create(res, rider);
});

// Update a rider in Riders table
router.put('/:id', validateUser('Rider'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Rider, { id }, body, tableName);
});

// Add a location to favorites
router.post('/:id/favorites', validateUser('Rider'), (req, res) => {
  const { params: { id }, body: { id: locId } } = req;
  // check if location exists in table
  db.getById(res, Location, locId, 'Locations', () => {
    const operation = { $ADD: { favoriteLocations: [locId] } };
    const condition = new Condition('favoriteLocations').not().contains(locId);
    db.conditionalUpdate(
      res, Rider, { id }, operation, condition, tableName, ({ favoriteLocations }: RiderType) => {
        const keys = createKeys('id', favoriteLocations);
        db.batchGet(res, Location, keys, 'Locations');
      },
    );
  });
});

// Delete an existing rider
router.delete('/:id', validateUser('Admin'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Rider, id, tableName);
});

export default router;
