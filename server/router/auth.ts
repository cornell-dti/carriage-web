import { OAuth2Client } from 'google-auth-library';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import express from 'express';
import AWS from 'aws-sdk';
import config from '../config';

const router = express.Router();

AWS.config.update(config);
const docClient = new AWS.DynamoDB.DocumentClient();

const validIDs = [
  '322014396101-q7vtrj4rg7h8tlknl1gati2lkbdbu3sp.apps.googleusercontent.com',
  '241748771473-o2cbaufs2p6qu6bvhfurdkki78fvn6hs.apps.googleusercontent.com',
  '3763570966-h9kjq9q71fpb0pl0k8vhl3ogsbqcld96.apps.googleusercontent.com',
  '241748771473-e85o2d6heucd28loiq5aacese38ln4l4.apps.googleusercontent.com',
  '346199868830-dfi7n737u4g6ajl3ketot11d1m3n1sr3.apps.googleusercontent.com',
  '322014396101-8u88pc3q00v6dre4doa64psr9349bhum.apps.googleusercontent.com',
];

async function verify(clientID: string, token: string): Promise<void> {
  const client = new OAuth2Client(clientID);
  client.verifyIdToken({
    idToken: token,
    audience: validIDs,
  })
    .then((ticket) => ticket.getPayload())
    .catch((err) => { throw err; });
}

// Verify an authentication token
router.post('/', async (req, res) => {
  const { token, clientID } = req.body;
  verify(token, clientID)
    .then(() => res.send({ success: true }))
    .catch(() => res.send({ success: false }));
});

export default router;
