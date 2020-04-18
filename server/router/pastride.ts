import express from 'express';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a past ride by ID in Past Rides table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'PastRides',
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

export default router;
