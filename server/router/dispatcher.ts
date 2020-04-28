import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Using a String enum allows the enum to be parsed by JSON.parse()
enum AccessLevel {
  Admin = "Admin", // only an admin should be able to add another dispatcher
  SDS = "SDS",
  Dispatcher = "Dispatcher"
}

type Dispatcher = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessLevel: AccessLevel
};

export default router;
