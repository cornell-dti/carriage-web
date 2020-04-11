/* eslint-disable no-console */
import express from 'express';
import bodyparser from 'body-parser';

import rider from './router/rider';
import driver from './router/driver';
import activeride from './router/activeride';
import pastride from './router/pastride';
import vehicle from './router/vehicle';
import location from './router/location';
import auth from './router/auth';

const port = 3001;

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use('/riders', rider);
app.use('/drivers', driver);
app.use('/active-rides', activeride);
app.use('/past-rides', pastride);
app.use('/vehicles', vehicle);
app.use('/locations', location);
app.use('/auth', auth);

app.listen(port, () => console.log('Listening at port', port));
