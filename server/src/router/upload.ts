import express from 'express';
import { S3 } from '@aws-sdk/client-s3';
import * as db from './common';
import { Driver } from '../models/driver';
import { Admin } from '../models/admin';
import { Location } from '../models/location';
import { Rider } from '../models/rider';
import { validateUser } from '../util';
import { config } from 'dotenv';
config();

// const BUCKET_NAME = 'dti-carriage-staging-public'; old bucket
const BUCKET_NAME = 'carriage-images';
const router = express.Router();
const s3Bucket = new S3({ region: 'us-east-2' });

router.post('/', validateUser('User'), (request, response) => {
  const {
    body: { id, tableName, fileBuffer, fileBuffers },
  } = request;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return response.status(400).json({ err: 'Invalid ID: empty or missing' });
  }

  if (!fileBuffer && !fileBuffers) {
    return response
      .status(400)
      .json({ err: 'Invalid file buffer(s): empty or missing' });
  }

  if (!['Drivers', 'Admins', 'Riders', 'Locations'].includes(tableName)) {
    return response
      .status(400)
      .json({ err: `Invalid table name: ${tableName}` });
  }

  // Single image upload fallback for legacy clients
  if (fileBuffer) {
    const objectKey = `${tableName}/${id}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: Buffer.from(fileBuffer, 'base64'),
      ObjectCannedACL: 'public-read',
      ContentEncoding: 'base64',
    };

    return s3Bucket.putObject(params, (s3Err: any) => {
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
          case 'Locations':
            db.update(response, Location, { id }, databaseOperation, tableName);
            break;
          case 'Riders':
            db.update(response, Rider, { id }, databaseOperation, tableName);
            break;
        }
      }
    });
  }

  // Multiple images upload (array of base64 strings)
  const buffers: string[] = Array.isArray(fileBuffers) ? fileBuffers : [];
  const uploadedUrls: string[] = [];

  let completed = 0;
  buffers.forEach((buf, index) => {
    const objectKey = `${tableName}/${id}/${index}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: Buffer.from(buf, 'base64'),
      ObjectCannedACL: 'public-read',
      ContentEncoding: 'base64',
    };

    s3Bucket.putObject(params, (s3Err: any) => {
      if (s3Err) {
        return response
          .status(s3Err.statusCode || 400)
          .send({ err: s3Err.message });
      }
      const url = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
      uploadedUrls.push(url);
      completed += 1;
      if (completed === buffers.length) {
        // Update DB with images array (for Locations only)
        if (tableName === 'Locations') {
          // Merge with existing images if any
          Location.get(id, (err, data) => {
            const existing: string[] = (data && (data as any).images) || [];
            const merged = Array.from(
              new Set([...(existing || []), ...uploadedUrls])
            );
            const databaseOperation = {
              $SET: {
                images: merged,
                photoLink: (data && (data as any).photoLink) || merged[0],
              },
            };
            db.update(response, Location, { id }, databaseOperation, tableName);
          });
        } else {
          response.send({ data: uploadedUrls });
        }
      }
    });
  });
});

export default router;

/**
 * This file handles image uploads to an S3 bucket.
 * The image upload allows for the replacement of an existing image for drivers and admins,
 * and updates the corresponding user's photo URL in the database. The uploaded image is
 * stored in the 'carriage-images' S3 bucket and is made publicly accessible. The route
 * validates the user, checks required fields, uploads the image to S3, and then updates
 * the relevant user record with the new image URL in the database.
 * This route performs the following actions:
 * 1. Validates the user via the `validateUser` middleware.
 * 2. Ensures that the `id`, `tableName`, and `fileBuffer` parameters are valid.
 * 3. Uploads the image to the S3 bucket using AWS SDK.
 * 4. Updates the corresponding driver's or admin's record in the database with the new
 * photo URL.
 * 5. Handles success and error responses, including S3 upload errors.
 */
