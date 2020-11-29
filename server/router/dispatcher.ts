import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Dispatcher } from '../models/dispatcher';

const router = express.Router();
const tableName = 'Dispatchers';

// Get all dispatchers
router.get('/', (req, res) => db.getAll(res, Dispatcher, tableName));

// Put a driver in Dispatchers table
router.post('/', (req, res) => {
  const { body } = req;
  const dispatcher = new Dispatcher({
    id: uuid(),
    ...body,
  });
  db.create(res, dispatcher);
});

// Remove Dispatcher
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Dispatcher, id, tableName);
});

export default router;
