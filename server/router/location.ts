import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type Location = {
  id: string,
  location: string,
};

// Get a location by ID in Locations table
router.get('/location/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Locations',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Put a location in Locations table
router.post('/locations', (req, res) => {
  const postBody = req.body;
  const location: Location = {
    id: uuid(),
    location: postBody.location,
  };
  const params = {
    TableName: 'Locations',
    Item: location,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(location);
    }
  });
});

// TODO: Update an existing location

// TODO: Delete an existing location

export default router;
