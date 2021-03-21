import { OAuth2Client } from 'google-auth-library';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ModelType } from 'dynamoose/dist/General';
import { Document } from 'dynamoose/dist/Document';
import { Rider } from '../models/rider';
import { Admin } from '../models/admin';
import { Driver } from '../models/driver';

const router = express.Router();

const audience = [
  '322014396101-q7vtrj4rg7h8tlknl1gati2lkbdbu3sp.apps.googleusercontent.com',
  '241748771473-o2cbaufs2p6qu6bvhfurdkki78fvn6hs.apps.googleusercontent.com',
  '3763570966-h9kjq9q71fpb0pl0k8vhl3ogsbqcld96.apps.googleusercontent.com',
  '241748771473-e85o2d6heucd28loiq5aacese38ln4l4.apps.googleusercontent.com',
  '346199868830-dfi7n737u4g6ajl3ketot11d1m3n1sr3.apps.googleusercontent.com',
  '322014396101-8u88pc3q00v6dre4doa64psr9349bhum.apps.googleusercontent.com',
  '241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com',
  '241748771473-c8p9845ouj8hh4sq6n37qv5fql1shk0c.apps.googleusercontent.com',
];

async function verify(clientId: string, token: string): Promise<LoginTicket> {
  const client = new OAuth2Client(clientId);
  const authRes = await client.verifyIdToken({ idToken: token, audience });
  return authRes;
}

function getModel(table: string) {
  const tableToModel: { [table: string]: ModelType<Document> } = {
    Riders: Rider,
    Drivers: Driver,
    Admins: Admin,
  };
  return tableToModel[table];
}

function getUserType(table: string) {
  return table.slice(0, table.length - 1);
}

function findUserAndSendToken(
  res: express.Response,
  model: ModelType<Document>,
  table: string,
  email: string,
) {
  model.scan({ email: { eq: email } }).exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (data?.length) {
      const { id } = data[0].toJSON();
      const userPayload = {
        id,
        userType: getUserType(table),
      };
      res.status(200).send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
    } else if (table === 'Admins') {
      // Check drivers table for admins
      Driver.scan({ email: { eq: email } }).exec((dErr, dData) => {
        if (dErr) {
          res.status(dErr.statusCode || 500).send({ err: dErr });
        } else if (dData?.length) {
          const { id, admin } = dData[0].toJSON();
          if (admin) {
            const userPayload = {
              id,
              userType: getUserType(table),
            };
            res.status(200).send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
          } else {
            res.status(400).send({ err: 'User not found' });
          }
        } else {
          res.status(400).send({ err: 'User not found' });
        }
      });
    } else {
      res.status(400).send({ err: 'User not found' });
    }
  });
}

// Verify an authentication token
router.post('/', (req, res) => {
  const { token, clientId, table, email } = req.body;
  verify(clientId, token)
    .then((authRes) => {
      const payload = authRes.getPayload();
      const model = getModel(table);
      if (payload?.aud === clientId && model) {
        findUserAndSendToken(res, model, table, email);
      } else if (payload?.aud !== clientId) {
        res.status(400).send({ err: 'Invalid client id' });
      } else if (!model) {
        res.status(400).send({ err: 'Table not found' });
      } else {
        res.status(400).send({ err: 'Payload not found' });
      }
    })
    .catch((err) => {
      res.status(err.statusCode || 500).send({ err: err.message });
    });
});

export default router;
