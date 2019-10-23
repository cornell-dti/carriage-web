const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

const app = express();
const main = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://carriage.firebaseio.com',
});

main.use('/api', app);

exports.webAPI = functions.https.onRequest(main);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
