import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import * as t from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

const Body = t.type({
  firstName: t.string,
  lastName: t.string,
  phoneNumber: t.string,
  email: t.string,
  accessibilityNeeds: t.type({
    needsWheelchair: t.boolean,
    hasCrutches: t.boolean,
    needsAssistant: t.boolean,
  }),
  description: t.string,
  picture: t.string,
  joinDate: t.string,
  pronouns: t.string,
  address: t.string,
});

// Get a rider by ID in Riders table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Riders',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(data);
    }
  });
});

// Get all riders
router.get('/', (req, res) => {
  const params = {
    TableName: 'Riders',
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send({ data: data.Items });
    }
  });
});

// Get all upcoming rides for a rider
router.get('/:id/rides', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Riders',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data.Item) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const { requestedRides } = data.Item;
      res.send({ data: requestedRides });
    }
  });
});

// Put a rider in Riders table
router.post('/', (req, res) => {
  const postBody = req.body;
  if (isRight(Body.decode(postBody))) {
    const user = {
      id: uuid(),
      ...postBody,
      pastRides: [],
      requestedRides: [],
      favoriteLocations: [],
    };
    const params = {
      TableName: 'Riders',
      Item: user,
    };
    docClient.put(params, (err, data) => {
      if (err) {
        res.send({ err });
      } else {
        res.send(user);
      }
    });
  } else {
    res.send({ err: { message: 'invalid json' } });
  }
});

// Update an existing rider
router.put('/:id', (req, res) => {
  const postBody = req.body;
});

// Delete an existing rider
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Riders',
    Key: { id },
  };
  docClient.delete(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(data);
    }
  });
});

export default router;
