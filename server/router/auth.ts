import { OAuth2Client } from 'google-auth-library';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ModelType } from 'dynamoose/dist/General';
import { Document } from 'dynamoose/dist/Document';
import { Rider } from '../models/rider';
import { Dispatcher, DispatcherType } from '../models/dispatcher';
import { Driver } from '../models/driver';

const router = express.Router();

const validIds = [
  '322014396101-q7vtrj4rg7h8tlknl1gati2lkbdbu3sp.apps.googleusercontent.com',
  '241748771473-o2cbaufs2p6qu6bvhfurdkki78fvn6hs.apps.googleusercontent.com',
  '3763570966-h9kjq9q71fpb0pl0k8vhl3ogsbqcld96.apps.googleusercontent.com',
  '241748771473-e85o2d6heucd28loiq5aacese38ln4l4.apps.googleusercontent.com',
  '346199868830-dfi7n737u4g6ajl3ketot11d1m3n1sr3.apps.googleusercontent.com',
  '322014396101-8u88pc3q00v6dre4doa64psr9349bhum.apps.googleusercontent.com',
  '241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com',
  '407408718192.apps.googleusercontent.com', // remove when done
];

async function verify(clientId: string, token: string): Promise<LoginTicket> {
  const client = new OAuth2Client(clientId);
  const authRes = await client.verifyIdToken({
    idToken: token,
    audience: validIds,
  });
  return authRes;
}

function getModel(table: string) {
  const tableToModel: { [table: string]: ModelType<Document> } = {
    Riders: Rider,
    Drivers: Driver,
    Dispatchers: Dispatcher,
  };
  return tableToModel[table];
}

function getUserType(table: string, user: any) {
  if (table === 'Dispatchers') {
    return (user as DispatcherType).accessLevel;
  }
  return table.slice(0, table.length - 1);
}

// Verify an authentication token
router.post('/', (req, res) => {
  const { token, clientId, table, email } = req.body;
  verify(clientId, token)
    .then((authRes) => {
      const payload = authRes.getPayload();
      const model = getModel(table);
      if (payload && payload.aud === clientId && model) {
        model.scan({ email: { eq: email } }).exec((err, data) => {
          if (err) {
            res.send({ err: err.message });
          } else if (data) {
            // Dynamoose type is incorrect
            const user: any = data[0];
            const userPayload = {
              id: user ? user.id : null,
              userType: getUserType(table, user),
            };
            res.send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
          } else {
            res.send({ success: false });
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
