import express from 'express';
import * as AWS from 'aws-sdk';

const router = express.Router();

const BUCKET_NAME = 'dti-carriage-staging-public';
const s3bucket = new AWS.S3();

// Upload base64-encoded fileBuffer to S3
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
});


export default router;
