import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

enum RideTypes {
  Active = 'Active',
  Past = 'Past',
  Unscheduled = 'Unscheduled',
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
    enum: ['Active', 'Past', 'Unscheduled'],
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

// Get an active/requested ride by ID in Active Rides table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Rides, id, 'Rides');
});

// Get all rides in table w/ optional date query
router.get('/', (req, res) => {
  const { riderID } = req.query;
  if (riderID) {
    const condition = new dynamoose.Condition('riderID').eq(riderID).where('type').eq('Unscheduled');
    Rides.query(condition).using('riderIndex').exec((err: any, data: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  } else {
    db.getAll(res, Rides, 'Rides');
  }
  // if (date) {
  //   // adding 'EST' to date adds correct offset to UTC when returning toISOString()
  //   const rangeStart = new Date(`${date} EST`).toISOString();
  //   const rangeEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
  //   const condition = new dynamoose.Condition({
  //     FilterExpression: '#time between :start and :end',
  //     ExpressionAttributeNames: {
  //       '#time': 'startTime',
  //     },
  //     ExpressionAttributeValues: {
  //       ':start': rangeStart,
  //       ':end': rangeEnd,
  //     },
  //   });
  //   Rides.query(condition).exec((err, data) => {
  //     if (err) {
  //       res.send({ err });
  //     } else if (!data) {
  //       res.send({ data: [] });
  //     } else {
  //       res.send({ data });
  //     }
  //   });
  // }
  // db.getAll(res, Rides, 'Active Rides');
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rideID = uuid();
  const ride = new Rides({
    type: RideTypes.Unscheduled,
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
