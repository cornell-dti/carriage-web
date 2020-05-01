import express from 'express';
import uuid from 'uuid/v1';
import dynamoose from 'dynamoose';
import { isRight } from 'fp-ts/lib/Either';

import { Locations } from './location';

const router = express.Router();

type Key = {
  id: string
};

type RiderType = {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  accessibilityNeeds: {
    needsWheelchair: boolean,
    hasCrutches: boolean,
    needsAssistant: boolean,
  },
  description: string,
  joinDate: string,
  pronouns: string,
  address: string,
  favoriteLocations: string[]
};

const schema = new dynamoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  accessibilityNeeds: {
    type: Object,
    schema: {
      needsWheelchair: Boolean,
      hasCrutches: Boolean,
      needsAssistant: Boolean,
    },
  },
  description: String,
  joinDate: String,
  pronouns: String,
  address: String,
  favoriteLocations: {
    type: Array,
    schema: [String],
  },
}, {
  saveUnknown: true,
});

export const Riders = dynamoose.model('Riders', schema, { create: false });

// Get a rider by ID in Riders table
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Get all riders
router.get('/', (req, res) => {
  Riders.scan('', (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Get all upcoming rides for a rider
router.get('/:id/rides', (req, res) => {
  // const { id } = req.params;
  // const params = {
  //   TableName: 'Riders',
  //   Key: { id },
  // };
  // docClient.get(params, (err, data) => {
  //   if (err) {
  //     res.send({ err });
  //   } else if (!data.Item) {
  //     res.send({ err: { message: 'id not found' } });
  //   } else {
  //     const { requestedRides } = data.Item;
  //     if (!requestedRides.length) {
  //       res.send({ data: [] });
  //     } else {
  //       const rideParams = {
  //         RequestItems: {
  //           ActiveRides: {
  //             Keys: requestedRides,
  //           },
  //         },
  //       };
  //       docClient.batchGet(rideParams, (rideErr, rideData) => {
  //         if (rideErr) {
  //           res.send({ err: rideErr });
  //         } else {
  //           res.send({ data: rideData.Responses!.ActiveRides });
  //         }
  //       });
  //     }
  //   }
  // });
});

// Get profile information for a rider
router.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data: any) => {
    const rider: RiderType = data;
    if (err) {
      res.send({ err });
    } else {
      const {
        email, firstName, lastName, phoneNumber, pronouns, joinDate,
      } = rider;
      res.send({
        email, firstName, lastName, phoneNumber, pronouns, joinDate,
      });
    }
  });
});

// Get accessibility information for a rider
router.get('/:id/accessibility', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data: any) => {
    const rider: RiderType = data;
    if (err) {
      res.send({ err });
    } else {
      const { description, accessibilityNeeds } = rider;
      res.send({ description, accessibilityNeeds });
    }
  });
});

// Get all favorite locations for a rider
router.get('/:id/favorites', (req, res) => {
  const { id } = req.params;
  Riders.get(id, (err, data: any) => {
    if (err) {
      res.send({ err });
    } else {
      console.log(data);
      const rider: RiderType = data;
      const { favoriteLocations } = rider;
      console.log(favoriteLocations);
      const keys: Key[] = favoriteLocations.map((locID: string) => ({
        id: locID,
      }));
      if (!keys.length) {
        res.send({ data: [] });
      } else {
        Locations.batchGet(keys, (locErr, locData) => {
          if (locErr) {
            res.send({ err: locErr });
          } else {
            res.send({ data: locData });
          }
        });
      }
    }
  });
  // const { id } = req.params;
  // const params = {
  //   TableName: 'Riders',
  //   Key: { id },
  // };
  // docClient.get(params, (err, data) => {
  //   if (err) {
  //     res.send({ err });
  //   } else if (!data.Item) {
  //     res.send({ err: { message: 'id not found' } });
  //   } else {
  //     const { favoriteLocations } = data.Item;
  //     const keys: Key[] = favoriteLocations.map((locID: string) => ({
  //       id: locID,
  //     }));
  //     if (!keys.length) {
  //       res.send({ data: [] });
  //     } else {
  //       const locParams = {
  //         RequestItems: {
  //           Locations: {
  //             Keys: keys,
  //           },
  //         },
  //       };
  //       docClient.batchGet(locParams, (locErr, locData) => {
  //       });
  //     }
  //   }
  // });
});
/**
// Create a rider in Riders table
router.post('/', (req, res) => {
  if (isRight(Body.decode(req.body))) {
    const postBody = req.body;
    const user = {
      id: uuid(),
      ...postBody,
      pastRides: [],
      requestedRides: [],
      favoriteLocations: [],
    };
    const params = {
      TableName: 'Riders',
      Item: user,
    };
    docClient.put(params, (err, _) => {
      if (err) {
        res.send({ err });
      } else {
        res.send(user);
      }
    });
  } else {
    res.send({ err: { message: 'invalid json' } });
  }
});

// Update a rider in Riders table
router.post('/:id', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  const params = {
    TableName: 'Riders',
    Key: { id },
  };
  docClient.get(params, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data.Item) {
      res.send({ err: { message: 'id not found' } });
    } else {
      const rider = data.Item;
      const updateParams = {
        TableName: 'Riders',
        Item: { id } as { [key: string]: any },
      };
      Object.keys(rider).forEach((key) => {
        updateParams.Item[key] = postBody[key] || rider[key];
      });
      docClient.put(updateParams, (updateErr, _) => {
        if (updateErr) {
          res.send({ err: updateErr });
        } else {
          res.send(updateParams.Item);
        }
      });
    }
  });
});

// Add a location to favorites
router.post('/:id/favorites', (req, res) => {
  const { id } = req.params;
  const postBody = req.body;
  const locID = postBody.id;
  const locParams = {
    TableName: 'Locations',
    Key: { id: locID },
  };
  docClient.get(locParams, (err, data) => {
    if (err) {
      res.send({ err });
    } else if (!data.Item) {
      res.send({ err: { message: 'location not found' } });
    } else {
      const location = data.Item;
      const riderParams = {
        TableName: 'Riders',
        Key: { id },
        UpdateExpression: 'SET #fl = list_append(#fl, :val)',
        ExpressionAttributeNames: { '#fl': 'favoriteLocations' },
        ExpressionAttributeValues: { ':val': [locID] },
      };
      docClient.update(riderParams, (riderErr, _) => {
        if (riderErr) {
          res.send({ err: riderErr });
        } else {
          res.send(location);
        }
      });
    }
  });
});

// Delete an existing rider
router.delete('/:id', (req, res) => deleteByID(req, res, docClient, 'Riders'));
 */

export default router;
