const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

async function verify(clientID, token) {
  const client = new OAuth2Client(clientID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientID,
  });
  const payload = ticket.getPayload();
  const userID = payload.sub;
  return userID;
}

app.post('/verifyTokenWithID', (req, res) => {
  try {
    const { clientID, token } = req.body;
    res.send({ userID: verify(clientID, token) });
  } catch (err) {
    res.send(err);
  }
});

app.listen(5000);
