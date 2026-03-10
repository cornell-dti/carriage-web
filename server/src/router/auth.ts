import express from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { OAuth2Client } from 'google-auth-library';
import { oauthValues } from '../config';
import { UnregisteredUserType } from '@carriage-web/shared/types';

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
 * Derives the singular user type from the table name.
 * For example, 'Riders' becomes 'Rider'.
 * @param table - The string name of the table.
 */
function getUserType(table: string) {
  return table.slice(0, table.length - 1);
}

/**
 * Finds a user in Prisma by email and sends back a JWT token if found.
 * If logging in as an Admin and no match is found, the Driver table is checked as a fallback for admin-flagged users.
 * @param res - Express response object.
 * @param table - Name of the user table (used to derive userType).
 * @param email - The email address to look up.
 * @param userInfo - Optional user info from Google OAuth (name, etc.).
 */
async function findUserAndSendToken(
  res: express.Response,
  table: string,
  email: string,
  userInfo?: Partial<UnregisteredUserType>
) {
  try {
    let user: any = null;

    if (table === 'Riders') {
      user = await prisma.rider.findUnique({ where: { email } });
      if (user && !user.active) {
        res.status(400).send({ err: 'User not active' });
        return;
      }
    } else if (table === 'Drivers') {
      user = await prisma.driver.findUnique({ where: { email } });
    } else if (table === 'Admins') {
      user = await prisma.admin.findUnique({ where: { email } });

      // Fallback: Check drivers table for admins
      if (!user) {
        const driver = await prisma.driver.findUnique({ where: { email } });
        if (driver) {
          user = driver;
        }
      }
    }

    if (user) {
      const userPayload = {
        id: user.id,
        userType: getUserType(table),
      };
      res.status(200).send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
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
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).send({ err: 'Internal server error' });
  }
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
    const validTables = ['Riders', 'Drivers', 'Admins'];
    if (!validTables.includes(table)) {
      res.status(400).send({ err: 'Table not found' });
      return;
    }

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

    if (email) {
      await findUserAndSendToken(res, table, email, { name });
    } else {
      res.status(400).send({ err: 'Email not found' });
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
      const validTables = ['Riders', 'Drivers', 'Admins'];
      if (!validTables.includes(table)) {
        res.status(400).send({ err: 'Table not found' });
        return;
      }

      if (email) {
        await findUserAndSendToken(res, table, email, { name: email });
      } else {
        res.status(400).send({ err: 'Email not found' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ err });
    }
  });
}

export default router;
