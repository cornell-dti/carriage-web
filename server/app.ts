/* eslint-disable no-console */
import express from 'express';
import dynamoose from 'dynamoose';
import bodyparser from 'body-parser';
import config from './config';
import rider from './router/rider';
import driver from './router/driver';
import dispatcher from './router/dispatcher';
import ride from './router/ride';
import vehicle from './router/vehicle';
import location from './router/location';
import auth from './router/auth';

const port = process.env.PORT || 3001;

dynamoose.aws.sdk.config.update(config);

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use('/api/riders', rider);
app.use('/api/drivers', driver);
app.use('/api/dispatchers', dispatcher);
app.use('/api/rides', ride);
app.use('/api/vehicles', vehicle);
app.use('/api/locations', location);
app.use('/api/auth', auth);
app.get('/api/health-check', (_, response) => response.status(200).send('OK'));

app.listen(port, () => console.log('Listening at port', port));
