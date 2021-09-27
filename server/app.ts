/* eslint-disable no-console */
import express from 'express';
import dynamoose from 'dynamoose';
import path from 'path';
import cors from 'cors';
import config from './config';
import rider from './router/rider';
import driver from './router/driver';
import admin from './router/admin';
import ride from './router/ride';
import vehicle from './router/vehicle';
import location from './router/location';
import upload from './router/upload';
import auth from './router/auth';
import stats from './router/stats';
import initSchedule from './util/repeatingRide';
import notification from './router/notification';

const port = Number(process.env.PORT) || 3001;

/**
 * Only necessary when testing local backend on a physical mobile device.
 * Find your hostname: https://www.whatismybrowser.com/detect/what-is-my-local-ip-address
 * Then add USE_HOSTNAME (true/false) and HOSTNAME to your server env file.
 */
const useHostname = Boolean(process.env.USE_HOSTNAME);
const hostname = (useHostname && process.env.HOSTNAME) || '';

dynamoose.aws.sdk.config.update(config);

const app = express();
app.use(cors());
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api/riders', rider);
app.use('/api/drivers', driver);
app.use('/api/admins', admin);
app.use('/api/rides', ride);
app.use('/api/vehicles', vehicle);
app.use('/api/locations', location);
app.use('/api/auth', auth);
app.use('/api/upload', upload);
app.use('/api/notification', notification);
app.use('/api/stats', stats);
app.get('/api/health-check', (_, response) => response.status(200).send('OK'));

// Serve static files from frontend
const frontendBuild = '../../frontend/build';
app.use(express.static(path.join(__dirname, frontendBuild)));

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, frontendBuild, 'index.html'));
});

initSchedule();

app.listen(port, hostname, () => console.log('Listening at port', port));
