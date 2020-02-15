import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type BreakType = {
  'Mon': {
    breakStart: string,
    breakEnd: string,
  },
  'Tue': {
    breakStart: string,
    breakEnd: string,
  },
  'Wed': {
    breakStart: string,
    breakEnd: string,
  },
  'Thu': {
    breakStart: string,
    breakEnd: string,
  },
  'Fri': {
    breakStart: string,
    breakEnd: string,
  },
}

type Driver = {
  id: string,
  firstName: string,
  lastName: string,
  startTime: string,
  endTime: string,
  breaks: BreakType | null,
  vehicle: string,
  phoneNumber: string,
  email: string,
};

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
  const breaks = postBody.breaks ?? null;
  const user: Driver = {
    id: uuid(),
    firstName: postBody.firstName,
    lastName: postBody.lastName,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    breaks,
    vehicle: postBody.vehicle,
    phoneNumber: postBody.phoneNumber,
    email: postBody.email,
  };
  const params = {
    TableName: 'Drivers',
    Item: user,
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
