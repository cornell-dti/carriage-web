const AWS = require('aws-sdk');
require('dotenv').config();

const config = new AWS.Config({
  // hardcode the config for now, DO NOT PUSH
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

module.exports = config;
