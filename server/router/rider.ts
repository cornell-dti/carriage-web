import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

// Get a rider by ID in Riders table
router.get('/rider/:riderID', (req, res) => {
  const { riderID } = req.params;
  const params = {
    TableName: 'Riders',
    Key: {
      id: riderID,
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

// Put a rider in Riders table
router.post('/riders', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Riders',
    Item: {
      id: uuid(),
      name: postBody.name,
      phoneNumber: postBody.phoneNumber,
      email: postBody.email,
      accessibility: {
        needsWheelchair: postBody.needsWheelchair,
        hasCrutches: postBody.hasCrutches,
        needsAssistant: postBody.needsAssistant,
      },
      description: postBody.description,
      picture: postBody.picture,
      joinDate: postBody.joinDate,
      pronouns: postBody.pronouns,
      pastRides: [] as string[],
      requestedRides: [] as string[],
      address: postBody.address,
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
