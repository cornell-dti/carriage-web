import express from 'express';
import { v4 as uuid } from 'uuid';
import * as db from './common';
import { Admin } from '../models/admin';
import { validateUser, checkNetIDExists, checkNetIDExistsForOtherEmployee } from '../util';
import { UserType } from '../models/subscription';

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
router.post('/', validateUser('Admin'), async (req, res) => {
  try {
    const { body } = req;

    const emailExists = await checkNetIDExists(body.email);
    if (emailExists) {
      return res.status(409).send({
        err: 'An employee with this NetID already exists'
      });
    }

    const admin = new Admin({
      id: !body.eid || body.eid === '' ? uuid() : body.eid,
      firstName: body.firstName,
      lastName: body.lastName,
      type: body.type,
      isDriver: body.isDriver,
      phoneNumber: body.phoneNumber,
      email: body.email,
    });

    db.create(res, admin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).send({ err: 'Failed to create admin' });
  }
});

// Update an existing admin
router.put('/:id', validateUser('Admin'), async (req, res) => {
  try {
    const {
      params: { id },
      body,
    } = req;

    // Check if email is being changed and if it conflicts with another employee
    if (body.email) {
      const emailExists = await checkNetIDExistsForOtherEmployee(body.email, id);
      if (emailExists) {
        return res.status(409).send({
          err: 'An employee with this NetID already exists'
        });
      }
    }

    db.update(res, Admin, { id }, body, tableName);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send({ err: 'Failed to update admin' });
  }
});

// Remove an admin
router.delete('/:id', validateUser('Admin'), (req, res) => {
  const {
    params: { id },
  } = req;
  db.deleteById(res, Admin, id, tableName);
});

export default router;
