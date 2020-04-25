import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type BreakTimes = {
  breakStart: string,
  breakEnd: string,
}

type BreakType = {
  Mon?: BreakTimes,
  Tue?: BreakTimes,
  Wed?: BreakTimes,
  Thu?: BreakTimes,
  Fri?: BreakTimes,
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
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Drivers',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data.Item);
    }
  });
});

// Put a driver in Drivers table
router.post('/', (req, res) => {
  const postBody = req.body;
  const user: Driver = {
    id: uuid(),
    firstName: postBody.firstName,
    lastName: postBody.lastName,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    breaks: postBody.breaks ?? null,
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
      res.send(user);
    }
  });
});

// TODO: Update an existing driver

// TODO: Delete an existing driver

export default router;
