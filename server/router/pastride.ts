import express from 'express';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a past ride by ID in Past Rides table
router.get('/past-ride/:rideID', (req, res) => {
  const { rideID } = req.params;
  const params = {
    TableName: 'Past Rides',
    Key: {
      id: rideID,
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

export default router;
