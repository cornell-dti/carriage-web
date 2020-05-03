import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';
import { deleteByID } from './common';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Using a String enum allows the enum to be parsed by JSON.parse()
enum AccessLevel {
  Admin = 'Admin', // only an admin should be able to add another dispatcher
  SDS = 'SDS',
  Dispatcher = 'Dispatcher'
}

type Dispatcher = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessLevel: AccessLevel
};

// Put a driver in Dispatchers table
router.post('/', (req, res) => {
  const user: Dispatcher = {
    id: uuid(),
    ...JSON.parse(JSON.stringify(req.body)),
  };
  const params = {
    TableName: 'Dispatchers',
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

// Remove Dispatcher
router.delete('/:id', (req, res) => deleteByID(req, res, docClient, 'Dispatchers'));

export default router;
