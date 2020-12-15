/* eslint-disable no-console */
import express from 'express';
import dynamoose from 'dynamoose';
import * as AWS from 'aws-sdk';
import bodyparser from 'body-parser';
import config from './config';
import rider from './router/rider';
import driver from './router/driver';
import dispatcher from './router/dispatcher';
import ride from './router/ride';
import vehicle from './router/vehicle';
import location from './router/location';
import auth from './router/auth';
import upload from './router/upload';

const port = process.env.PORT || 3001;

dynamoose.aws.sdk.config.update(config);
AWS.config.update(config);

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use('/riders', rider);
app.use('/drivers', driver);
app.use('/dispatchers', dispatcher);
app.use('/rides', ride);
app.use('/vehicles', vehicle);
app.use('/locations', location);
app.use('/auth', auth);
app.use('/upload', upload);
app.get('/health-check', (_, response) => response.status(200).send('OK'));

app.listen(port, () => console.log('Listening at port', port));
