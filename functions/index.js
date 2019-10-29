const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
const main = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://carriage-471ba.firebaseio.com',
});

main.use('/api', app);

exports.webAPI = functions.https.onRequest(main);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/addUser', (req, res) => {
  const {
    userEmail, userPhone, userPass, userName,
  } = req.body;
  admin.auth().createUser({
    email: userEmail,
    emailVerified: false,
    phoneNumber: userPhone,
    password: userPass,
    displayName: userName,
    disabled: false,
  })
    .then((userRecord) => {
      res.send({ id: userRecord.uid });
    })
    .catch((error) => {
      res.send(error);
    });
});
