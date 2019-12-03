const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const bodyparser = require('body-parser');
const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const config = require('./config');

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

const clientID = '241748771473-o2cbaufs2p6qu6bvhfurdkki78fvn6hs.apps.googleusercontent.com';

async function verify(token) {
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

// Put a rider in Riders table
app.post('/riders', (req, res) => {
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

// Put a driver in Drivers table
app.post('/drivers', (req, res) => {
  const postBody = req.body;
  const params = {
    TableName: 'Drivers',
    Item: {
      id: uuid(),
      startTime: postBody.startTime,
      endTime: postBody.endTime,
      breaks: postBody.breaks,
      vehicle: postBody.vehicle,
      phoneNumber: postBody.phoneNumber,
      email: postBody.email,
      name: postBody.name,
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

// Put an active ride in Active Rides table
app.post('/activeRides', (req, res) => {
  // Call to scheduling algorithm here?
  const postBody = req.body;
  const params = {
    TableName: 'Active Rides',
    Item: {
      id: uuid(),
      startLocation: postBody.startLocation,
      endLocation: postBody.endLocation,
      startTime: postBody.startTime,
      endTime: postBody.endTime,
      isScheduled: postBody.isScheduled,
      riderID: postBody.riderID,
      driverID: postBody.driverID,
      dateRequested: postBody.dateRequested,
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

// Put a vehicle in Vehicles table
app.post('/vehicles', (req, res) => {
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

// Put a location in Locations table
app.post('/locations', (req, res) => {
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


// Verify an authentication token
app.post('/verify', async (req, res) => {
  const { token } = req.body;
  try {
    await verify(token);
  } catch (err) {
    res.send({ success: 'false' });
  }
  res.send({ success: 'true' });
  console.log('verified');
});

app.listen(3000, () => console.log('Listening at port', 3000));
