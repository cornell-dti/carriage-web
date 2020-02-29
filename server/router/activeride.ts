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
  startTime: number,
  endTime: number,
  isScheduled: boolean,
  riderID: string,
  driverID: string | null,
  repeatsOn: string[] | null,
};

// Get an active/requested ride by ID in Active Rides table
router.get('/active-ride/:rideID', (req, res) => {
  const { rideID } = req.params;
  const params = {
    TableName: 'ActiveRides',
    Key: {
      id: rideID,
    },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Put an active ride in Active Rides table
router.post('/active-rides', (req, res) => {
  const postBody = req.body;
  const ride: ActiveRide = {
    id: uuid(),
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
    TableName: 'Active Rides',
    Item: ride,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(ride);
    }
  });
});

export default router;
