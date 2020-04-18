import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type Vehicle = {
  id: string,
  wheelchairAccessible: boolean,
};

// Get a vehicle by ID in Vehicles table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Vehicles',
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

// Put a vehicle in Vehicles table
router.post('/', (req, res) => {
  const postBody = req.body;
  const vehicle: Vehicle = {
    id: uuid(),
    wheelchairAccessible: postBody.wheelchairAccessible,
  };
  const params = {
    TableName: 'Vehicles',
    Item: vehicle,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(vehicle);
    }
  });
});

// TODO: Update an existing vehicle

// TODO: Update an existing vehicle

export default router;
