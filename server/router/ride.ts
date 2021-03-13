import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Ride, RideLocation } from '../models/ride';
import { Tag } from '../models/location';
import { validateUser } from '../util';

const router = express.Router();
const tableName = 'Rides';

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName);
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { query } = req;
  if (query === {}) {
    db.getAll(res, Ride, tableName);
  } else {
    const { type, status, rider, driver, date } = query;
    let condition = new Condition();
    if (type) {
      condition = condition.where('type').eq(type);
    }
    if (status) {
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
router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { rider, startTime, requestedEndTime, driver, startLocation, endLocation, info },
  } = req;

  let startLocationObj: RideLocation | undefined;
  let endLocationObj: RideLocation | undefined;

  if (!validate(startLocation)) {
    const name = startLocation.split(',')[0];
    startLocationObj = {
      name,
      address: startLocation,
      tag: Tag.CUSTOM,
      info,
    };
  }

  if (!validate(endLocation)) {
    const name = endLocation.split(',')[0];
    endLocationObj = {
      name,
      address: endLocation,
      tag: Tag.CUSTOM,
      info,
    };
  }

  const ride = new Ride({
    id: uuid(),
    rider,
    startLocation: startLocationObj ?? startLocation,
    endLocation: endLocationObj ?? endLocation,
    startTime,
    requestedEndTime,
    endTime: requestedEndTime,
    driver,
  });
  db.create(res, ride);
});

// Update an existing ride
router.put('/:id', validateUser('User'), (req, res) => {
  const { params: { id }, body } = req;
  db.update(res, Ride, { id }, body, tableName);
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Ride, id, tableName);
});

export default router;
