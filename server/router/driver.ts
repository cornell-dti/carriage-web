import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';
import { deleteByID } from './common';

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

// Get all drivers
router.get('/', (req, res) => {
  const params = {
    TableName: 'Drivers',
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send({ data: data.Items });
    }
  });
});

// Get profile information for a driver
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Drivers',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err);
    } else if (!data.Item) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const {
        email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
      } = data.Item;
      res.send({
        email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
      });
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

// Update an existing driver
router.post('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  const params = {
    TableName: 'Drivers',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data.Item) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const driver = data.Item;
      const updateParams = {
        TableName: 'Drivers',
        Item: { id } as { [key: string]: any },
      };
      Object.keys(driver).forEach((key) => {
        updateParams.Item[key] = postBody[key] || driver[key];
      });
      docClient.put(updateParams, (updateErr, _) => {
        if (updateErr) {
          res.send({ err: updateErr });
        } else {
          res.send(updateParams.Item);
        }
      });
    }
  });
});

// Delete an existing driver
router.delete('/:id', (req, res) => deleteByID(req, res, docClient, 'Drivers'));

export default router;
