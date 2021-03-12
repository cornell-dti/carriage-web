import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Ride, RideType, Type } from '../models/ride';
import { Location, Tag } from '../models/location';
import { validateUser } from '../util';
import * as csv from '@fast-csv/format';

const router = express.Router();
const tableName = 'Rides';

router.get('/download', function(req, res) {
  const dateStart = new Date(`${req.query.date} EST`).toISOString();
  const dateEnd = new Date(`${req.query.date} 23:59:59.999 EST`).toISOString();
  const condition = new Condition().where('startTime').between(dateStart, dateEnd).where('type').eq('schduled');;

  const callback = (value: any) => {
    const dataToExport = value.map((doc: any) => {
      const start = new Date(doc.startTime);
      const end = new Date(doc.endTime);
      return {
        name: `${doc.rider.firstName} ${doc.rider.lastName.substring(0, 1)}.`,
        pickUp: `${start.getHours()}:${start.getMinutes()}`,
        from: doc.startLocation.address,
        to: doc.endLocation.address,
        dropOff: `${end.getHours()}:${end.getMinutes()}`,
      }
    })
    csv
      .writeToBuffer(dataToExport, { headers: ['Name', 'Pick Up', 'From', 'To', 'Drop Off'] })
      .then((data) => {
        res.send(data)
      })
      .catch((err) => res.send(err));
    }
  db.scan(res, Ride, condition, callback);
})

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName);
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { query } = req;
  if (query === {}) {
    db.getAll(res, Ride, tableName);
  } else {
    const { type, status, rider, driver, date } = query;
    let condition = new Condition();
    if (type) {
      condition = condition.where('type').eq(type);
    }
    if (status) {
      condition = condition.where('status').eq(status);
    }
    if (rider) {
      condition = condition.where('rider').eq(rider);
    }
    if (driver) {
      condition = condition.where('driver').eq(driver);
    }
    if (date) {
      const dateStart = new Date(`${date} EST`).toISOString();
      const dateEnd = new Date(`${date} 23:59:59.999 EST`).toISOString();
      condition = condition.where('startTime').between(dateStart, dateEnd);
    }
    db.scan(res, Ride, condition);
  }
});

// Put a ride in Rides table
router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { rider, startTime, requestedEndTime, driver, startLocation, endLocation },
  } = req;

  let startLocationId;
  let endLocationId;

  if (!validate(startLocation)) {
    startLocationId = uuid();
    const location = new Location({
      id: startLocationId,
      name: 'Custom',
      address: startLocation,
      tag: Tag.CUSTOM,
    });
    location.save();
  }

  if (!validate(endLocation)) {
    endLocationId = uuid();
    const location = new Location({
      id: endLocationId,
      name: 'Custom',
      address: endLocation,
      tag: Tag.CUSTOM,
    });
    location.save();
  }

  const ride = new Ride({
    id: uuid(),
    rider,
    startLocation: startLocationId ?? startLocation,
    endLocation: endLocationId ?? endLocation,
    startTime,
    requestedEndTime,
    endTime: requestedEndTime,
    driver,
  });
  db.create(res, ride);
});

// Update an existing ride
router.put('/:id', validateUser('User'), (req, res) => {
  const { params: { id }, body } = req;
  if (body.type === Type.PAST) {
    db.getById(res, Ride, id, tableName, (ride) => {
      const {
        startLocation: { id: startId, tag: startTag },
        endLocation: { id: endId, tag: endTag },
      } = ride as RideType;
      if (startTag === Tag.CUSTOM) {
        body.startLocation = 'Custom';
        Location.delete(startId);
      }
      if (endTag === Tag.CUSTOM) {
        body.endLocation = 'Custom';
        Location.delete(endId);
      }
      db.update(res, Ride, { id }, body, tableName);
    });
  } else {
    db.update(res, Ride, { id }, body, tableName);
  }
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Ride, id, tableName);
});

export default router;
