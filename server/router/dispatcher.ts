import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Dispatcher } from '../models/dispatcher';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Dispatchers';

// Get all dispatchers
router.get('/', (req, res) => db.getAll(res, Dispatcher, tableName));

// Put a driver in Dispatchers table
router.post('/', validateUser('Dispatcher'), (req, res) => {
  const { body } = req;
  const dispatcher = new Dispatcher({
    ...body,
    id: uuid(),
  });
  db.create(res, dispatcher);
});

// Remove Dispatcher
router.delete('/:id', validateUser('Dispatcher'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Dispatcher, id, tableName);
});

export default router;
