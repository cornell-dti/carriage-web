/* eslint-disable no-console */
import express from 'express';
import path from 'path';
import cors from 'cors';

// Set default timezone for moment
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

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
import initDynamoose from './util/dynamoose';

// SSO imports (conditionally loaded)
import sso from './router/sso';
import passport from './auth/passport-sso';
import { sessionMiddleware } from './auth/session';

const port = Number(process.env.PORT) || 3001;

/**
 * Only necessary when testing local backend on a physical mobile device.
 * Find your hostname: https://www.whatismybrowser.com/detect/what-is-my-local-ip-address
 * Then add USE_HOSTNAME (true/false) and HOSTNAME to your server env file.
 */
const useHostname = process.env.USE_HOSTNAME === 'true';
const hostname = (useHostname && process.env.HOSTNAME) || '';

initDynamoose();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// SSO middleware (only if enabled)
if (process.env.SSO_ENABLED === 'true') {
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
}

// Very useful API Debugger Method.
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body); // Requires body-parser or express.json()
//   next();
// });

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

// SSO routes (only if enabled)
if (process.env.SSO_ENABLED === 'true') {
  app.use('/api/sso', sso);
}

app.get('/api/health-check', (_, response) => response.status(200).send('OK'));

// Serve static files from frontend
const frontendBuild = '../../frontend/build';
app.use(express.static(path.join(__dirname, frontendBuild)));

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, frontendBuild, 'index.html'));
});

initSchedule();

if (useHostname) {
  app.listen(port, hostname, () =>
    console.log(`Listening at http://${hostname}:${port}`)
  );
} else {
  app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
}

export default app;
