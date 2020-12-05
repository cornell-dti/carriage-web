import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Dispatcher } from '../models/dispatcher';

const router = express.Router();
const tableName = 'Dispatchers';

// Put a driver in Dispatchers table
router.post('/', (req, res) => {
  const { body } = req;
  const dispatcher = new Dispatcher({
    ...body,
    id: uuid()
  });
  db.create(res, dispatcher);
});

// Remove Dispatcher
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Dispatcher, id, tableName);
});

export default router;
