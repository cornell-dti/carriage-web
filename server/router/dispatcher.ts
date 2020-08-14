import express from 'express';
import { v4 as uuid } from 'uuid';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

// only an admin should be able to add another dispatcher
type AccessLevel = 'Admin' | 'SDS' | 'Dispatcher'

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

const Dispatcher = dynamoose.model('Dispatchers', schema, { create: false });

// Put a driver in Dispatchers table
router.post('/', (req, res) => {
  const postBody = req.body;
  const dispatcher = new Dispatcher({
    id: uuid(),
    ...postBody,
  });
  db.create(res, dispatcher);
});

// Remove Dispatcher
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.deleteByID(res, Dispatcher, id, 'Dispatchers');
});

export default router;
