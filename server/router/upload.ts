import express from 'express';
import * as AWS from 'aws-sdk';
import { Condition } from 'dynamoose/dist/Condition';
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Dispatcher } from '../models/dispatcher';

const router = express.Router();

const BUCKET_NAME = 'dti-carriage-staging-public';
const s3bucket = new AWS.S3();

// Uploads base64-encoded {fileBuffer} to S3 with the key {tableName}/{userId}
// Updates the user's DB photoLink field to the url of the uploaded image (base64 string)
router.post('/', (req, res) => {
  const { body: { userId, tableName, fileBuffer } } = req;

  const objectKey = `${tableName}/${userId}`;

  const type = fileBuffer.split(';')[0].split('/')[1];

  const params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/${type}`,
  };

  try {
    s3bucket.putObject(params, (s3Err, s3data) => {
      if (s3Err) {
        res.send(s3Err);
      }
    });

    const objectLink = `${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
    const operation = { photoLink: objectLink };
    const condition = new Condition().not().exists('photoLink');

    if (tableName === 'Drivers') {
      db.conditionalUpdate(res, Driver, { id: userId }, operation, condition, tableName);
    } else if (tableName === 'Riders') {
      db.conditionalUpdate(res, Rider, { id: userId }, operation, condition, tableName);
    } else if (tableName === 'Dispatchers') {
      db.conditionalUpdate(res, Dispatcher, { id: userId }, operation, condition, tableName);
    }
  } catch (err) {
    res.send(err);
  }
});

export default router;
