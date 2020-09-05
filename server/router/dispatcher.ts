import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Dispatcher } from '../models/dispatcher';

const router = express.Router();

const tableName = 'Dispatchers';

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
  db.deleteById(res, Dispatcher, id, tableName);
});

export default router;
