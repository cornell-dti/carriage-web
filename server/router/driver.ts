import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import * as db from './common';

const router = express.Router();

type BreakTimes = {
  breakStart: string,
  breakEnd: string,
}

type BreakType = {
  Mon?: BreakTimes,
  Tue?: BreakTimes,
  Wed?: BreakTimes,
  Thu?: BreakTimes,
  Fri?: BreakTimes,
}

type DriverType = {
  id: string,
  firstName: string,
  lastName: string,
  startTime: string,
  endTime: string,
  breaks: BreakType | null,
  vehicle: string,
  phoneNumber: string,
  email: string,
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  startTime: String,
  endTime: String,
  breaks: Object,
  vehicle: String,
  phoneNumber: String,
  email: String,
});

export const Drivers = dynamoose.model('Drivers', schema, { create: false });

// Get a driver by ID in Drivers table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Drivers.get(id, (err, data) => {
    if (err) {
      res.send(err);
    } else if (!data) {
      res.send({ err: { message: 'id not found' } });
    } else {
      res.send(data);
    }
  });
});

// Get all drivers
router.get('/', (req, res) => {
  Drivers.scan().exec((err, data) => {
    if (err) {
      res.send(err);
    } else if (!data) {
      res.send({ err: { message: 'items not found' } });
    } else {
      res.send(data);
    }
  });
});

// Get profile information for a driver
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  Drivers.get(id, (err, data: any) => {
    if (err) {
      res.send(err);
    } else if (!data) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const driver: DriverType = data;
      const {
        email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
      } = driver;
      res.send({
        email, firstName, lastName, phoneNumber, startTime, endTime, breaks, vehicle,
      });
    }
  });
});

// Put a driver in Drivers table
router.post('/', (req, res) => {
  const postBody = req.body;
  const driver = new Drivers({
    id: uuid(),
    ...postBody,
  });
  driver.save((err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(data);
    }
  });
});

// Update an existing driver
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  Drivers.update({ id }, postBody, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Delete an existing driver
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Drivers.get(id, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data) {
      res.send({ err: { message: 'id not found in Drivers' } });
    } else {
      data.delete().then(() => res.send({ id }));
    }
  });
});

export default router;
