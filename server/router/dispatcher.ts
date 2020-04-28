import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type Dispatcher = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
};

export default router;
