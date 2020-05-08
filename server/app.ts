/* eslint-disable no-console */
import express from 'express';
import cookieParser from 'cookie-parser';
import withAuth from './middleware';
import dynamoose from 'dynamoose';
import bodyparser from 'body-parser';
import config from './config';
import rider from './router/rider';
import driver from './router/driver';
import dispatcher from './router/dispatcher';
import activeride from './router/activeride';
import pastride from './router/pastride';
import vehicle from './router/vehicle';
import location from './router/location';
import auth from './router/auth';

const port = 3001;

dynamoose.aws.sdk.config.update(config);

const app = express();
app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use('/riders', withAuth, rider);
app.use('/drivers', withAuth, driver);
app.use('/dispatchers', withAuth, dispatcher);
app.use('/active-rides', withAuth, activeride);
app.use('/past-rides', withAuth, pastride);
app.use('/vehicles', withAuth, vehicle);
app.use('/locations', location);
app.use('/auth', auth);

app.listen(port, () => console.log('Listening at port', port));
