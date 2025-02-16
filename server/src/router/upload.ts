import express from 'express';
import {
  S3,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import * as db from './common';
import { Driver } from '../models/driver';
import { Admin } from '../models/admin';
import { validateUser } from '../util';
import dotenv from 'dotenv';
dotenv.config();

// const BUCKET_NAME = 'dti-carriage-staging-public'; old bucket
const BUCKET_NAME = 'carriage-images';
const router = express.Router();
const s3Bucket = new S3({ region: 'us-east-2' });

router.post('/', validateUser('User'), (request, response) => {
  const {
    body: { id, tableName, fileBuffer },
  } = request;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return response.status(400).json({ err: 'Invalid ID: empty or missing' });
  }

  if (!fileBuffer || typeof fileBuffer !== 'string') {
    return response
      .status(400)
      .json({ err: 'Invalid file buffer: empty or missing' });
  }

  // Only Drivers and Admins can upload images.
  if (tableName != 'Drivers' && tableName != 'Admins') {
    return response
      .status(400)
      .json({ err: `Invalid table name: ${tableName}` });
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
      response.status(s3Err.statusCode || 400).send({ err: s3Err.message });
    } else {
      const photoLink = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
      const databaseOperation = { $SET: { photoLink } };
      switch (tableName) {
        case 'Drivers':
          db.update(response, Driver, { id }, databaseOperation, tableName);
          break;
        case 'Admins':
          db.update(response, Admin, { id }, databaseOperation, tableName);
          break;
      }
    }
  });
});

export default router;
