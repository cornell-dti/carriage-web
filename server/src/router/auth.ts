import express from 'express';
import jwt from 'jsonwebtoken';
import { Rider } from '../models/rider';
import { Admin } from '../models/admin';
import { Driver } from '../models/driver';
import { OAuth2Client } from 'google-auth-library';
import { oauthValues } from '../config';
import { ModelType } from 'dynamoose/dist/General';
import { Item } from 'dynamoose/dist/Item';
import { UnregisteredUserType } from '../util/types';

const router = express.Router();

const audience = [
  // driver ios
  '241748771473-a4q5skhr0is8r994o7ie9scrnm5ua760.apps.googleusercontent.com',
  // android
  '241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com',
  // web
  '241748771473-da6i0hbtsl78nlkvbvaauvigh3lv0gt0.apps.googleusercontent.com',
  // rider ios
  '241748771473-7rfda2grc8f7p099bmf98en0q9bcvp18.apps.googleusercontent.com',
];

/**
 * Returns the appropriate model (Rider, Driver, Admin) for a given table name.
 * @param table - The string name of the table (e.g., 'Riders', 'Drivers', 'Admins').
 */
function getModel(table: string) {
  const tableToModel: { [table: string]: ModelType<Item> } = {
    Riders: Rider,
    Drivers: Driver,
    Admins: Admin,
  };
  return tableToModel[table];
}

/**
 * Derives the singular user type from the table name.
 * For example, 'Riders' becomes 'Rider'.
 * @param table - The string name of the table.
 */
function getUserType(table: string) {
  return table.slice(0, table.length - 1);
}

/**
 * Finds a user in the specified model by email and sends back a JWT token if found.
 * If logging in as an Admin and no match is found, the Driver table is checked as a fallback for admin-flagged users.
 * @param res - Express response object.
 * @param model - The model to query (Rider, Admin, or Driver).
 * @param table - Name of the user table (used to derive userType).
 * @param email - The email address to look up.
 * @param userInfo - Optional user info from Google OAuth (name, etc.).
 */
function findUserAndSendToken(
  res: express.Response,
  model: ModelType<Item>,
  table: string,
  email: string,
  userInfo?: Partial<UnregisteredUserType>
) {
  model.scan({ email: { eq: email } }).exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
      return;
    }

    if (data?.length) {
      const { id, active } = data[0].toJSON();
      if (table === 'Riders' && !active) {
        res.status(400).send({ err: 'User not active' });
        return;
      }
      const userPayload = {
        id,
        userType: getUserType(table),
      };
      res
        .status(200)
        .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
    } else if (table === 'Admins') {
      // Check drivers table for admins
      // when the frontend page is made, this removed and we only use the first scan and change the error handling to check
      // per table this is because we would have decoupled admins and drivers, so drivers wouldnt sign on admin page and vice versa
      // but maybe we would allow admins to log onto the driver page?
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
            res
              .status(200)
              .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
          } else {
            const unregisteredUser: UnregisteredUserType = {
              email: email,
              name: userInfo?.name || 'User',
            };
            res.status(400).send({
              err: 'User not found',
              user: unregisteredUser,
            });
          }
        } else {
          const unregisteredUser: UnregisteredUserType = {
            email: email,
            name: userInfo?.name || 'User',
          };
          res.status(400).send({
            err: 'User not found',
            user: unregisteredUser,
          });
        }
      });
    } else {
      const unregisteredUser: UnregisteredUserType = {
        email: email,
        name: userInfo?.name || 'User',
      };
      res.status(400).send({
        err: 'User not found',
        user: unregisteredUser,
      });
    }
  });
}

/**
 * Exchanges an OAuth2 authorization code for an ID token using the provided client.
 * @param client - An instance of OAuth2Client.
 * @param code - The authorization code returned from Google login.
 */
async function getIdToken(client: OAuth2Client, code: string) {
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token!;
  return idToken;
}

// Verify an authentication token
// If a code is supplied, retrieves the token from the code such that either a
// code or token is sufficient
router.post('/', async (req, res) => {
  const { code, table } = req.body;
  try {
    const client = new OAuth2Client({
      clientId: oauthValues.client_id,
      clientSecret: oauthValues.client_secret,
      redirectUri: req.get('origin'),
    });
    const idToken = req.body.idToken || (await getIdToken(client, code));
    const result = await client.verifyIdToken({ idToken, audience });
    const payload = result.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const model = getModel(table);
    if (model && email) {
      findUserAndSendToken(res, model, table, email, { name });
    } else if (!model) {
      res.status(400).send({ err: 'Table not found' });
    } else if (!email) {
      res.status(400).send({ err: 'Email not found' });
    } else {
      res.status(400).send({ err: 'Payload not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
});

if (process.env.NODE_ENV === 'test') {
  router.post('/dummy', async (req, res) => {
    const { email, table } = req.body;
    try {
      const model = getModel(table);
      if (model && email) {
        findUserAndSendToken(res, model, table, email, { name: email });
      } else if (!model) {
        res.status(400).send({ err: 'Table not found' });
      } else if (!email) {
        res.status(400).send({ err: 'Email not found' });
      } else {
        res.status(400).send({ err: 'Payload not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ err });
    }
  });
}

export default router;
