import express from 'express';
import { Response } from 'express';
import * as AWS from 'aws-sdk';
import { Condition } from 'dynamoose';
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Dispatcher } from '../models/dispatcher';

const router = express.Router();

const BUCKET_NAME = 'dti-carriage-staging-public';
const s3bucket = new AWS.S3();

// Sets the user's standard photoLink if it is not already set.
export function addPhotoLink(
  res: Response,
  model: db.ModelType,
  tableName: string,
  userId: string,
  objectKey: string,
) {
  db.getById(res, model, userId, tableName, () => {
    const operation = { $ADD: { photoLink: [objectKey] } };
    const condition = new Condition().not().exists('photoLink');
    db.conditionalUpdate(res, model, { userId }, operation, condition, tableName);
  });
}

// Uploads base64-encoded fileBuffer to S3, with an object key {tableName}/{userId}
router.post('/', (req, res) => {
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

  if (tableName === 'Drivers') {
    addPhotoLink(res, Driver, tableName, userId, objectKey);
  }
  if (tableName === 'Riders') {
    addPhotoLink(res, Rider, tableName, userId, objectKey);
  }
  if (tableName === 'Dispatchers') {
    addPhotoLink(res, Dispatcher, tableName, userId, objectKey);
  }
});


export default router;
