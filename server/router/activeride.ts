import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type ActiveRide = {
  id: string,
  startLocation: string,
  endLocation: string,
  startTime: string,
  endTime: string,
  isScheduled: boolean,
  riderID: string[],
  driverID: string[] | null,
  repeatsOn: string[] | null,
};

// Get an active/requested ride by ID in Active Rides table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'ActiveRides',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(data.Item);
    }
  });
});

// Get all rides in table w/ optional date query
router.get('/', (req, res) => {
  const { date } = req.query;
  const params: any = {
    TableName: 'ActiveRides',
  };
  if (date) {
    // adding 'EST' to date adds correct offset to UTC when returning toISOString()
    const rangeStart = new Date(`${date} EST`).toISOString();
    const rangeEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    params.FilterExpression = '#time between :start and :end';
    params.ExpressionAttributeNames = {
      '#time': 'startTime',
    };
    params.ExpressionAttributeValues = {
      ':start': rangeStart,
      ':end': rangeEnd,
    };
  }
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send({ data: data.Items });
    }
  });
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rideID = uuid();
  const ride: ActiveRide = {
    id: rideID,
    startLocation: postBody.startLocation,
    endLocation: postBody.endLocation,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    isScheduled: false,
    riderID: postBody.riderID,
    driverID: null,
    repeatsOn: postBody.repeatsOn ?? null,
  };
  const params = {
    TableName: 'ActiveRides',
    Item: ride,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      const riderParams = {
        TableName: 'Riders',
        Key: { id: postBody.riderID },
        UpdateExpression: 'SET #rr = list_append(#rr, :val)',
        ExpressionAttributeNames: { '#rr': 'requestedRides' },
        ExpressionAttributeValues: {
          ':val': [{ id: rideID, startTime: postBody.startTime }],
        },
      };
      docClient.update(riderParams, (riderErr, riderData) => {
        if (riderErr) {
          res.send({ err: riderErr });
        } else {
          res.send(ride);
        }
      });
    }
  });
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
