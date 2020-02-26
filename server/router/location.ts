import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a location by ID in Locations table
router.get('/location/:locationID', (req, res) => {
  const { locationID } = req.params;
  const params = {
    TableName: 'Locations',
    Key: {
      id: locationID,
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


// Put a location in Locations table
router.post('/locations', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Locations',
    Item: {
      id: uuid(),
      location: postBody.location,
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
