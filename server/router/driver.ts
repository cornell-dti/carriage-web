import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a driver by ID in Drivers table
router.get('/driver/:driverID', (req, res) => {
  const { driverID } = req.params;
  const params = {
    TableName: 'Drivers',
    Key: {
      id: driverID,
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

// Put a driver in Drivers table
router.post('/drivers', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Drivers',
    Item: {
      id: uuid(),
      startTime: postBody.startTime,
      endTime: postBody.endTime,
      breaks: postBody.breaks,
      vehicle: postBody.vehicle,
      phoneNumber: postBody.phoneNumber,
      email: postBody.email,
      name: postBody.name,
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
