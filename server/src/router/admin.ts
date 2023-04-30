import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Admin } from '../models/admin';
import { validateUser } from '../util';
import { Condition } from 'dynamoose';

const router = express.Router();
const tableName = 'Admins';

// Get an admin
router.get('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.getById(res, Admin, id, tableName);
});

// Get all admins
router.get('/', validateUser('Admin'), (req, res) => {
  db.getAll(res, Admin, tableName);
});

// Put a driver in Admins table
router.post('/', validateUser('Admin'), (req, res) => {
  const { body } = req;
  const admin = new Admin({
    ...body,
    id: uuid(),
  });

  db.create(res, admin);
});

// Update an existing admin
router.put('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const condition = new Condition().where('id').eq(id);

  db.conditionalUpdate(res, Admin, { id }, body, condition, tableName);
});

// Remove an admin
router.delete('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.deleteById(res, Admin, id, tableName);
});

export default router;
