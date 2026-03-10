import express from 'express';
import { S3 } from '@aws-sdk/client-s3';
import { prisma } from '../db/prisma';
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

    return s3Bucket.putObject(params, async (s3Err: any) => {
      if (s3Err) {
        response.status(s3Err.statusCode || 400).send({ err: s3Err.message });
      } else {
        try {
          const photoLink = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${objectKey}`;
          let updated;
          switch (tableName) {
            case 'Drivers':
              updated = await prisma.driver.update({
                where: { id },
                data: { photoLink },
              });
              break;
            case 'Admins':
              updated = await prisma.admin.update({
                where: { id },
                data: { photoLink },
              });
              break;
            case 'Locations':
              updated = await prisma.location.update({
                where: { id },
                data: { photoLink },
              });
              break;
            case 'Riders':
              updated = await prisma.rider.update({
                where: { id },
                data: { photoLink },
              });
              break;
          }
          response.status(200).send({ data: updated });
        } catch (error) {
          console.error('Error updating photo link:', error);
          response.status(500).send({ err: 'Failed to update photo link' });
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
          (async () => {
            try {
              const location = await prisma.location.findUnique({ where: { id } });
              const existing: string[] = (location && location.images) || [];
              const merged = Array.from(
                new Set([...(existing || []), ...uploadedUrls])
              );
              const updated = await prisma.location.update({
                where: { id },
                data: {
                  images: merged,
                  photoLink: (location && location.photoLink) || merged[0],
                },
              });
              response.status(200).send({ data: updated });
            } catch (error) {
              console.error('Error updating location images:', error);
              response.status(500).send({ err: 'Failed to update location images' });
            }
          })();
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
