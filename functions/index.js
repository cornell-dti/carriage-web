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
      res.send({ userID: userRecord.uid });
    })
    .catch((error) => {
      res.send(error);
    });
});

app.delete('/deleteUserByID', (req, res) => {
  const { userID } = req.body;
  admin.auth().deleteUser(userID)
    .then(() => {
      res.send({ userID });
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post('/createTokenByID', (req, res) => {
  const { userID } = req.body;
  admin.auth().createCustomToken(userID)
    .then((customToken) => {
      res.send({ token: customToken });
    })
    .catch((error) => {
      res.send(error);
    });
});
