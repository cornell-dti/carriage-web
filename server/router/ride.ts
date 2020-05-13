import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import { Condition } from 'dynamoose/dist/Condition';
import * as db from './common';

const router = express.Router();

enum RideTypes {
  active = 'active',
  past = 'past',
  unscheduled = 'unscheduled',
}

type Ride = {
  type: RideTypes,
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
      name: 'timeIndex',
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
      name: 'riderIndex',
      rangeKey: 'type',
      global: true,
    } as any,
  },
  driverID: {
    type: String,
    index: {
      name: 'driverIndex',
      rangeKey: 'type',
      global: true,
    } as any,
  },
}, { saveUnknown: true });

export const Rides = dynamoose.model('Rides', schema, { create: false });

// Get a ride by ID in Rides table
router.get('/:type/:id', (req, res) => {
  const { id, type } = req.params;
  db.getByID(res, Rides, { id, type }, 'Rides');
});

// Get all rides in Rides table
router.get('/', (req, res) => db.getAll(res, Rides, 'Rides'));

// Query all rides in table
router.get('/:type', (req, res) => {
  const { type } = req.params;
  const { riderID, driverID, date } = req.query;
  let condition = new Condition('type').eq(type);
  let index;
  if (date) {
    const dateStart = new Date(`${date} EST`).toISOString();
    const dateEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    condition = condition.where('startTime').between(dateStart, dateEnd);
    index = 'timeIndex';
  }
  if (riderID) {
    condition = condition.where('riderID').eq(riderID);
    index = 'riderIndex';
  }
  if (driverID) {
    condition = condition.where('driverID').eq(driverID);
    index = 'driverIndex';
  }
  db.query(res, Rides, condition, index);
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rideID = uuid();
  const ride = new Rides({
    type: RideTypes.unscheduled,
    id: rideID,
    startLocation: postBody.startLocation,
    endLocation: postBody.endLocation,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    riderID: postBody.riderID,
  });
  db.create(res, ride);
});

// TODO: Update an existing ride
router.put('/:id', (req, res) => {
  res.send();
});

// TODO: Delete an existing ride
router.delete('/:id', (req, res) => {
  res.send();
});

export default router;
