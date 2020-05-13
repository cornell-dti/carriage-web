import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import AWS from 'aws-sdk';
import config from '../config';
import * as db from './common';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type Ride = {
  id: string,
  startLocation: string,
  endLocation: string,
  startTime: string,
  endTime: string,
  riderID: string,
  driverID?: string,
};

const schema = new dynamoose.Schema({
  id: String,
  startLocation: String,
  endLocation: String,
  startTime: String,
  endTime: String,
  riderID: String,
  driverID: String,
}, { saveUnknown: true });

export const Rides = dynamoose.model('ActiveRides', schema, { create: false });

// Get an active/requested ride by ID in Active Rides table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.getByID(res, Rides, id, 'Active Rides');
});

// Get all rides in table w/ optional date query
router.get('/', (req, res) => {
  const { date } = req.query;
  if (date) {
    // adding 'EST' to date adds correct offset to UTC when returning toISOString()
    const rangeStart = new Date(`${date} EST`).toISOString();
    const rangeEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    const condition = new dynamoose.Condition({
      FilterExpression: '#time between :start and :end',
      ExpressionAttributeNames: {
        '#time': 'startTime',
      },
      ExpressionAttributeValues: {
        ':start': rangeStart,
        ':end': rangeEnd,
      },
    });
    Rides.query(condition).exec((err, data) => {
      if (err) {
        res.send({ err });
      } else if (!data) {
        res.send({ data: [] });
      } else {
        res.send({ data });
      }
    });
  }
  db.getAll(res, Rides, 'Active Rides');
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const postBody = req.body;
  const rideID = uuid();
  const ride: Ride = {
    id: rideID,
    startLocation: postBody.startLocation,
    endLocation: postBody.endLocation,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    riderID: postBody.riderID,
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
