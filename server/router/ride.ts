import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Ride, Type } from '../models/ride';

const router = express.Router();
const tableName = 'Rides';
const typeParam = ':type(active|past|unscheduled)';

// Get a ride by id in Rides table
router.get(`/${typeParam}/:id`, (req, res) => {
  const { params: { type, id } } = req;
  db.getById(res, Ride, { type, id }, tableName);
});

// Get all rides in Rides table
router.get('/', (req, res) => db.getAll(res, Ride, tableName));

// Query all rides in table
router.get(`/${typeParam}`, (req, res) => {
  const { params: { type }, query: { riderId, driverId, date } } = req;
  let condition = new Condition('type').eq(type);
  if (riderId) {
    condition = condition.where('riderId').eq(riderId);
  }
  if (driverId) {
    condition = condition.where('driverId').eq(driverId);
  }
  if (date) {
    const dateStart = new Date(`${date} EST`).toISOString();
    const dateEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    condition = condition.where('startTime').between(dateStart, dateEnd);
  }
  db.query(res, Ride, condition);
});

// Put an active ride in Active Rides table
router.post('/', (req, res) => {
  const { body } = req;
  const ride = new Ride({
    type: Type.UNSCHEDULED,
    id: uuid(),
    ...body,
  });
  db.create(res, ride);
});

// Update an existing ride
router.put(`/${typeParam}/:id`, (req, res) => {
  const { params: { type, id }, body } = req;
  db.update(res, Ride, { type, id }, body, tableName);
});

// Delete an existing ride
router.delete(`/${typeParam}/:id`, (req, res) => {
  const { params: { type, id } } = req;
  db.deleteById(res, Ride, { type, id }, tableName);
});

export default router;
