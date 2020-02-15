import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type Rider = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessibility: {
    needsWheelchair: boolean,
    hasCrutches: boolean,
    needsAssistant: boolean,
  },
  description: string,
  picture: string,
  joinDate: number,
  pronouns: string,
  address: string,
  pastRides: string[],
  requestedRides: string[],
};

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
<<<<<<< Updated upstream
  const newUser = {
    id: uuid(),
    name: postBody.name,
    phoneNumber: postBody.phoneNumber,
    email: postBody.email,
    accessibilityNeeds: postBody.accessibilityNeeds,
=======
  const user: Rider = {
    id: uuid(),
    firstName: postBody.firstName,
    lastName: postBody.lastName,
    phoneNumber: postBody.phoneNumber,
    email: postBody.email,
    accessibility: {
      needsWheelchair: postBody.needsWheelchair,
      hasCrutches: postBody.hasCrutches,
      needsAssistant: postBody.needsAssistant,
    },
>>>>>>> Stashed changes
    description: postBody.description,
    picture: postBody.picture,
    joinDate: postBody.joinDate,
    pronouns: postBody.pronouns,
<<<<<<< Updated upstream
    pastRides: [] as string[],
    requestedRides: [] as string[],
=======
    pastRides: [],
    requestedRides: [],
>>>>>>> Stashed changes
    address: postBody.address,
  };
  const params = {
    TableName: 'Riders',
<<<<<<< Updated upstream
    Item: newUser,
=======
    Item: user,
>>>>>>> Stashed changes
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(newUser);
    }
  });
});

export default router;
