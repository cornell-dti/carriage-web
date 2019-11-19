const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const bodyparser = require('body-parser');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
const config = require('./config');

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

async function verify(clientID, token) {
  const client = new OAuth2Client(clientID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientID,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Get a rider by ID in Riders table
app.get('/rider/:riderID', (req, res) => {
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

// Get a driver by ID in Drivers table
app.get('/driver/:driverID', (req, res) => {
  const { driverID } = req.params;
  const params = {
    TableName: 'Drivers',
    Key: {
      id: driverID,
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

// Get an active/requested ride by ID in Active Rides table
app.get('/activeRide/:rideID', (req, res) => {
  const { rideID } = req.params;
  const params = {
    TableName: 'Active Rides',
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

// Get a past ride by ID in Past Rides table
app.get('/pastRide/:rideID', (req, res) => {
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

// Get a location by ID in Locations table
app.get('/location/:locationID', (req, res) => {
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

// Get a vehicle by ID in Vehicles table
app.get('/vehicle/:vehicleID', (req, res) => {
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

// Post a rider in Riders table
app.post('/riders', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Riders',
    Item: {
      id: uuid(),
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
      pastRides: [],
      requestedRides: [],
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

// Verify an authentication token
app.post('/verify', (req, res) => {
  try {
    const { clientID, token } = req.body;
    res.send({ data: verify(clientID, token) });
  } catch (err) {
    res.send(err);
  }
});

app.listen(3000);
