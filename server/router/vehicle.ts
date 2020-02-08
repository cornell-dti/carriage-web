import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a vehicle by ID in Vehicles table
router.get('/vehicle/:vehicleID', (req, res) => {
  const { vehicleID } = req.params;
  const params = {
    TableName: 'Vehicles',
    Key: {
      id: vehicleID,
    },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Put a vehicle in Vehicles table
router.post('/vehicles', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Vehicles',
    Item: {
      id: uuid(),
      wheelchairAccessible: postBody.wheelchairAccessible,
    },
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

export default router;
