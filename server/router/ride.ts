import express from 'express';
import { v4 as uuid, validate } from 'uuid';
import { Condition } from 'dynamoose';
import * as csv from '@fast-csv/format';
import moment from 'moment';
import * as db from './common';
import { Ride, RideLocation, Type } from '../models/ride';
import { Tag } from '../models/location';
import { validateUser } from '../util';
import { DriverType } from '../models/driver';
import { RiderType } from '../models/rider';

const router = express.Router();
const tableName = 'Rides';

router.get('/download', (req, res) => {
  const dateStart = new Date(`${req.query.date} EST`).toISOString();
  const dateEnd = new Date(`${req.query.date} 23:59:59.999 EST`).toISOString();
  const condition = new Condition()
    .where('startTime')
    .between(dateStart, dateEnd)
    .where('type')
    .not()
    .eq('unscheduled');

  const callback = (value: any) => {
    const dataToExport = value.map((doc: any) => {
      const start = moment(doc.startTime);
      const end = moment(doc.endTime);
      const fullName = (user: RiderType | DriverType) => (
        `${user.firstName} ${user.lastName.substring(0, 1)}.`
      );
      return {
        Name: fullName(doc.rider),
        'Pick Up': start.format('h:mm A'),
        From: doc.startLocation.name,
        To: doc.endLocation.name,
        'Drop Off': end.format('h:mm A'),
        Needs: doc.rider.accessibility,
        Driver: fullName(doc.driver),
      };
    });
    csv
      .writeToBuffer(dataToExport, { headers: true })
      .then((data) => res.send(data))
      .catch((err) => res.send(err));
  };
  db.scan(res, Ride, condition, callback);
});

// Get a ride by id in Rides table
router.get('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.getById(res, Ride, id, tableName);
});

// Get and query all rides in table
router.get('/', validateUser('User'), (req, res) => {
  const { query } = req;
  const { type, status, rider, driver, date, scheduled } = query;
  let condition = new Condition();

  if (type) {
    condition = condition.where('type').eq(type);
  } else if (scheduled) {
    condition = condition.where('type').not().eq(Type.UNSCHEDULED);
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

  condition = condition.where('deleted').not().eq(true);
  db.scan(res, Ride, condition);
});

// Put a ride in Rides table
router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { rider, startTime, requestedEndTime, driver, startLocation, endLocation },
  } = req;

  let startLocationObj: RideLocation | undefined;
  let endLocationObj: RideLocation | undefined;

  if (!validate(startLocation)) {
    const name = startLocation.split(',')[0];
    startLocationObj = {
      name,
      address: startLocation,
      tag: Tag.CUSTOM,
    };
  }

  if (!validate(endLocation)) {
    const name = endLocation.split(',')[0];
    endLocationObj = {
      name,
      address: endLocation,
      tag: Tag.CUSTOM,
    };
  }

  const ride = new Ride({
    id: uuid(),
    rider,
    startLocation: startLocationObj ?? startLocation,
    endLocation: endLocationObj ?? endLocation,
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
  db.update(res, Ride, { id }, body, tableName);
});

// Delete an existing ride
router.delete('/:id', validateUser('User'), (req, res) => {
  const { params: { id } } = req;
  db.deleteById(res, Ride, id, tableName);
});

export default router;
