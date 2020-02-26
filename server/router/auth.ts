import { OAuth2Client } from 'google-auth-library';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';
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

async function verify(clientID: string, token: string): Promise<LoginTicket> {
  const client = new OAuth2Client(clientID);
  const authRes = await client.verifyIdToken({
    idToken: token,
    audience: validIDs,
  });
  return authRes;
}

// Verify an authentication token
router.post('/', (req, res) => {
  const { token, clientID, userType, email } = req.body;
  verify(clientID, token)
    .then((authRes) => {
      const payload = authRes.getPayload();
      if (payload && payload.aud === clientID) {
        const params = {
          TableName: userType === 'rider' ? 'Riders' : 'Drivers',
          ProjectionExpression: 'id, email',
          FilterExpression: 'email = :user_email',
          ExpressionAttributeValues: {
            ':user_email': email,
          },
        };
        docClient.scan(params, (err, data) => {
          if (err) {
            res.send(err);
          } else {
            const userList = data.Items;
            res.send({ id: userList![0].id ?? null });
          }
        });
      } else {
        res.send({ success: false });
      }
    })
    .catch(() => {
      res.send({ success: false });
    });
});

export default router;
