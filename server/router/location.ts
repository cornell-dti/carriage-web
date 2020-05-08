import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type LocationType = {
  id: string,
  name: string,
  address: string,
};

const schema = new dynamoose.Schema({
  id: String,
  name: String,
  address: String,
});

export const Locations = dynamoose.model('Locations', schema, { create: false });

// Get a location by ID in Locations table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'Locations',
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

// Put a location in Locations table
router.post('/', (req, res) => {
  const postBody = req.body;
  const location: LocationType = {
    id: uuid(),
    name: postBody.name,
    address: postBody.address,
  };
  const params = {
    TableName: 'Locations',
    Item: location,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else {
      res.send(location);
    }
  });
});

// TODO: Update an existing location

// TODO: Delete an existing location

export default router;
