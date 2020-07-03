import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import { Condition } from 'dynamoose/dist/Condition';
import * as db from './common';

const router = express.Router();

const enum RideType {
  active = 'active',
  past = 'past',
  unscheduled = 'unscheduled',
}

const enum Index {
  rider = 'riderIndex',
  driver = 'driverIndex',
  time = 'timeIndex',
}

type Ride = {
  type: RideType,
  id: string,
  startLocation: string,
  endLocation: string,
  startTime: string,
  endTime: string,
  riderID: string,
  driverID?: string,
};

const schema = new dynamoose.Schema({
  type: {
    hashKey: true,
    type: String,
    enum: ['active', 'past', 'unscheduled'],
    index: {
      name: Index.time,
      rangeKey: 'startTime',
    } as any,
  },
  id: {
    rangeKey: true,
    type: String,
  },
  startLocation: String,
  endLocation: String,
  startTime: String,
  endTime: String,
  riderID: {
    type: String,
    index: {
      name: Index.rider,
      rangeKey: 'type',
      global: true,
    } as any,
  },
  driverID: {
    type: String,
    index: {
      name: Index.driver,
      rangeKey: 'type',
      global: true,
    } as any,
  },
}, { saveUnknown: true });

export const Rides = dynamoose.model('Rides', schema, { create: false });

// Get a ride by ID in Rides table
router.get('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  db.getByID(res, Rides, { type, id }, 'Rides');
});

// Get all rides in Rides table
router.get('/', (req, res) => db.getAll(res, Rides, 'Rides'));

// Query all rides in table
router.get('/:type', (req, res) => {
  const { type } = req.params;
  const { riderID, driverID, date } = req.query;
  // default hash key is type, default index is none
  let condition = new Condition('type').eq(type);
  let index;
  if (riderID) {
    condition = condition.where('riderID').eq(riderID);
    // change index to riderIndex to use riderID as hash key
    index = Index.rider;
  }
  if (driverID) {
    condition = condition.where('driverID').eq(driverID);
    // change index to driverIndex (if not previously set) to use driverID as
    // hash key, otherwise use as filter expression
    index = index || Index.driver;
  }
  if (date) {
    const dateStart = new Date(`${date} EST`).toISOString();
    const dateEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    condition = condition.where('startTime').between(dateStart, dateEnd);
    // change index to timeIndex (if not previously set) to use startTime as
    // range key, otherwise use as filter expression
    index = index || Index.time;
  }
  db.query(res, Rides, condition, index);
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rideID = uuid();
  const ride = new Rides({
    type: RideType.unscheduled,
    id: rideID,
    startLocation: postBody.startLocation,
    endLocation: postBody.endLocation,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    riderID: postBody.riderID,
  });
  db.create(res, ride);
});

// Update an existing ride
router.put('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const postBody = req.body;
  db.update(res, Rides, { type, id }, postBody, 'Rides');
});

// Delete an existing ride
router.delete('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  db.deleteByID(res, Rides, { type, id }, 'Rides');
});

export default router;
