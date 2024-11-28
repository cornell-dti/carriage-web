import express from 'express';
import { S3, ObjectCannedACL } from '@aws-sdk/client-s3'; // Import required types
import * as db from './common';
import { Rider } from '../models/rider';
import { Driver } from '../models/driver';
import { Admin } from '../models/admin';
import { validateUser } from '../util';
import dotenv from 'dotenv';

// Load environment variables from .env file (if available)
dotenv.config();

//const BUCKET_NAME = 'dti-carriage-staging-public'; old bucket
const BUCKET_NAME = 'carriage-images';
const router = express.Router();
const s3Bucket = new S3({ region: 'us-east-2' });

router.post('/', validateUser('User'), (req, res) => {
  const {
    body: { id, tableName, fileBuffer },
  } = req;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ err: 'Invalid ID: empty or missing' });
  }

  if (!fileBuffer) {
    return res
      .status(400)
      .json({ err: 'Invalid file buffer: empty or missing' });
  }

  if (!['Riders', 'Drivers', 'Admins'].includes(tableName)) {
    return res.status(400).json({ err: 'Invalid table name' });
  }

  const objectKey = `${tableName}/${id}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: Buffer.from(fileBuffer, 'base64'),
    ObjectCannedACL: 'public-read',
    ContentEncoding: 'base64',
  };
  s3Bucket.putObject(params, (s3Err: any) => {
    if (s3Err) {
      res.status(s3Err.statusCode || 400).send({ err: s3Err.message });
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
          console.error('Invalid table.')
          break;
      }
      console.log('Success upload.')
    }
  });
});

export default router;
