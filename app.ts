import express from 'express';
import bodyparser from 'body-parser';

import rider from './router/rider';
import driver from './router/driver';
import activeride from './router/activeride';
import pastride from './router/pastride';
import vehicle from './router/vehicle';
import location from './router/location';
import auth from './router/auth';

const port = 3000;

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use('/', rider);
app.use('/', driver);
app.use('/', activeride);
app.use('/', pastride);
app.use('/', vehicle);
app.use('/', location);
app.use('/verify', auth);

app.listen(port, () => console.log('Listening at port', port));
