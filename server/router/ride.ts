import express from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Ride, Status, Type } from '../models/ride';

const router = express.Router();
const tableName = 'Rides';

// Get a ride by id in Rides table
router.get('/:id', (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName);
});

// Get and query all rides in table
router.get('/', (req, res) => {
  const { query } = req;
  if (query === {}) {
    db.getAll(res, Ride, tableName);
  } else {
    const { type, status, rider, driver, date } = query;
    let condition = new Condition();
    if (type) {
      condition = condition.where('type').eq(type);
    }
    if(status) {
      condition = condition.where('status').eq(status);
    }
    if (rider) {
      condition = condition.where('rider').eq(rider);
    }
    if (driver) {
      condition = condition.where('driver').eq(driver);
    }
    if (date) {
      const dateStart = new Date(`${date} EST`).toISOString();
      const dateEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
      condition = condition.where('startTime').between(dateStart, dateEnd);
    }
    db.scan(res, Ride, condition);
  }
});

// Put a ride in Rides table
router.post('/', (req, res) => {
  const {
    body: {
      rider,
      startLocation,
      endLocation,
      startTime,
      endTime,
    },
  } = req;
  const ride = new Ride({
    id: uuid(),
    type: Type.UNSCHEDULED,
    status: Status.NOT_STARTED,
    rider,
    startLocation,
    endLocation,
    startTime,
    endTime,
  });
  db.create(res, ride);
});

// Update an existing ride
router.put('/:id', (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Ride, { id }, body, tableName);
});

// Delete an existing ride
router.delete('/:id', (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Ride, id, tableName);
});

export default router;
