import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get an active/requested ride by ID in Active Rides table
router.get('/active-ride/:rideID', (req, res) => {
  const { rideID } = req.params;
  const params = {
    TableName: 'Active Rides',
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
  // Call to scheduling algorithm here?
  const postBody = req.body;
  const params = {
    TableName: 'Active Rides',
    Item: {
      id: uuid(),
      startLocation: postBody.startLocation,
      endLocation: postBody.endLocation,
      startTime: postBody.startTime,
      endTime: postBody.endTime,
      isScheduled: postBody.isScheduled,
      riderID: postBody.riderID,
      driverID: postBody.driverID,
      dateRequested: postBody.dateRequested,
    },
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

export default router;
