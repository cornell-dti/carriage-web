import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

// Using a String enum allows the enum to be parsed by JSON.parse()
enum AccessLevel {
  Admin = 'Admin', // only an admin should be able to add another dispatcher
  SDS = 'SDS',
  Dispatcher = 'Dispatcher'
}

type DispatcherType = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessLevel: AccessLevel
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessLevel: {
    type: String,
    enum: ['Admin', 'SDS', 'Dispatcher'],
  },
});

const Dispatchers = dynamoose.model('Dispatchers', schema, { create: false });

// Put a driver in Dispatchers table
router.post('/', (req, res) => {
  const dispatcher = new Dispatchers({
    id: uuid(),
    ...JSON.parse(JSON.stringify(req.body)),
  });
  db.create(res, dispatcher);
});

// Remove Dispatcher
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteByID(res, Dispatchers, id, 'Dispatchers');
});

export default router;
