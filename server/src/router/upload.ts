import express from 'express';
import { S3, ObjectCannedACL } from '@aws-sdk/client-s3'; // Import required types
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Admin } from '../models/admin';
import { validateUser } from '../util';

const router = express.Router();

const BUCKET_NAME = 'dti-carriage-staging-public';
const s3bucket = new S3();

// Uploads base64-encoded fileBuffer to S3 in the folder {tableName}
// Sets the user's DB photoLink field to the url of the uploaded image, if not set
router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { id, tableName, fileBuffer },
  } = req;
  const validTables = ['Riders', 'Drivers', 'Admins'];
  if (fileBuffer === '') {
    res.status(400).send({ err: 'Invalid file name: empty string' });
  } else if (validTables.includes(tableName)) {
    const objectKey = `${tableName}/${id}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: Buffer.from(fileBuffer, 'base64'),
      ACL: ObjectCannedACL.public_read, // Use the enum for ACL here
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };

    // Put object into S3 bucket
    s3bucket.putObject(params, (s3Err: any) => {
      if (s3Err) {
        res.status(s3Err || 500).send({ err: s3Err.message });
      } else {
        const photoLink = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
        const operation = { $SET: { photoLink } };

        if (tableName === 'Drivers') {
          db.update(res, Driver, { id }, operation, tableName);
        } else if (tableName === 'Riders') {
          db.update(res, Rider, { id }, operation, tableName);
        } else if (tableName === 'Admins') {
          db.update(res, Admin, { id }, operation, tableName);
        }
      }
    });
  } else {
    res.status(400).send({ err: 'Invalid table.' });
  }
});

export default router;
