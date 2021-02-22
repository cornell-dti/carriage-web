import express from 'express';
import * as AWS from 'aws-sdk';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Dispatcher } from '../models/dispatcher';
import { validateUser } from '../util';

const router = express.Router();

const BUCKET_NAME = 'dti-carriage-staging-public';
const s3bucket = new AWS.S3();

// Uploads base64-encoded fileBuffer to S3 in the folder {tableName}
// Sets the user's DB photoLink field to the url of the uploaded image, if not set
router.post('/', validateUser('User'), (req, res) => {
  const { body: { userId, tableName, fileBuffer } } = req;
  const objectKey = `${tableName}/${userId}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: fileBuffer,
    ACL: 'public-read',
  };

  s3bucket.putObject(params, (s3Err, s3data) => {
    if (s3Err) {
      res.send(s3Err);
    } else {
      res.send(s3data);
    }
  });

  const objectLink = `${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
  const operation = { $ADD: { photoLink: [objectLink] } };
  const condition = new Condition().not().exists('photoLink');

  if (tableName === 'Drivers') {
    db.conditionalUpdate(res, Driver, { userId }, operation, condition, tableName);
  } else if (tableName === 'Riders') {
    db.conditionalUpdate(res, Rider, { userId }, operation, condition, tableName);
  } else if (tableName === 'Dispatchers') {
    db.conditionalUpdate(res, Dispatcher, { userId }, operation, condition, tableName);
  }
});

export default router;
