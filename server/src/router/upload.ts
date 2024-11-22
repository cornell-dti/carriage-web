import express from 'express';
import { S3, ObjectCannedACL } from '@aws-sdk/client-s3'; // Import required types
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Admin } from '../models/admin';
import { validateUser } from '../util';

//const BUCKET_NAME = 'dti-carriage-staging-public'; old bucket
const BUCKET_NAME = 'carriage-images';
const router = express.Router();
const s3Bucket = new S3();

router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { id, tableName, fileBuffer },
  } = req;
  if (fileBuffer === '') {
    res.status(400).send({ err: 'Invalid file name: empty string' });
  } else if (['Riders', 'Drivers', 'Admins'].includes(tableName)) {
    const objectKey = `${tableName}/${id}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: Buffer.from(fileBuffer, 'base64'),
      ACL: ObjectCannedACL.public_read,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };
    s3Bucket.putObject(params, (s3Err: any) => {
      if (s3Err) {
        res.status(s3Err.statusCode || 500).send({ err: s3Err.message });
      } else {
        const photoLink = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
        const operation = { $SET: { photoLink } };
        switch (tableName) {
          case 'Drivers':
            db.update(res, Driver, { id }, operation, tableName);
            break;
          case 'Riders':
            db.update(res, Rider, { id }, operation, tableName);
            break;
          case 'Admins':
            db.update(res, Admin, { id }, operation, tableName);
            break;
          default:
            res.status(400).send({ err: 'Invalid table.' });
            break;
        }
      }
    });
  }
});

export default router;
