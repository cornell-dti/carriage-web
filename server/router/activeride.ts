import express from 'express';
import uuid from 'uuid/v1';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

type ActiveRide = {
  id: string,
  startLocation: string,
  endLocation: string,
  startTime: string,
  endTime: string,
  isScheduled: boolean,
  riderID: string[],
  driverID: string[] | null,
  repeatsOn: string[] | null,
};

// Get an active/requested ride by ID in Active Rides table
router.get('/active-ride/:id', (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: 'ActiveRides',
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

// Get all rides in table w/ optional date query
router.get('/active-rides', (req, res) => {
  const { date } = req.query;
  const params: any = {
    TableName: 'ActiveRides',
  };
  if (date) {
    // adding 'EST' to date adds correct offset to UTC when returning toISOString()
    const rangeStart = new Date(`${date} EST`).toISOString();
    const rangeEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
    params.FilterExpression = '#time between :start and :end';
    params.ExpressionAttributeNames = {
      '#time': 'startTime',
    };
    params.ExpressionAttributeValues = {
      ':start': rangeStart,
      ':end': rangeEnd,
    };
  }
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ data: data.Items });
    }
  });
});

// Put an active ride in Active Rides table
router.post('/active-rides', (req, res) => {
  const postBody = req.body;
  const ride: ActiveRide = {
    id: uuid(),
    startLocation: postBody.startLocation,
    endLocation: postBody.endLocation,
    startTime: postBody.startTime,
    endTime: postBody.endTime,
    isScheduled: false,
    riderID: postBody.riderID,
    driverID: null,
    repeatsOn: postBody.repeatsOn ?? null,
  };
  const params = {
    TableName: 'Active Rides',
    Item: ride,
  };
  docClient.put(params, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(ride);
    }
  });
  // TODO: Finish
  const riderParams = {
    TableName: 'Riders',
    Key: {
      id: postBody.riderID,
    },
    UpdateExpression: '',
  };
});

// TODO: Update an existing ride
router.put('/active-ride/:id', (req, res) => {
  res.send();
});

// TODO: Delete an existing ride
router.delete('/active-ride/:id', (req, res) => {
  res.send();
});

export default router;
