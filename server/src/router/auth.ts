import express from 'express';
import jwt from 'jsonwebtoken';
import { ModelType } from 'dynamoose/dist/General';
import { Document } from 'dynamoose/dist/Document';
import { Rider } from '../models/rider';
import { Admin } from '../models/admin';
import { Driver } from '../models/driver';

const router = express.Router();

const audience = [
  // driver ios
  '241748771473-a4q5skhr0is8r994o7ie9scrnm5ua760.apps.googleusercontent.com',
  // web + android
  '241748771473-0r3v31qcthi2kj09e5qk96mhsm5omrvr.apps.googleusercontent.com',
  // rider ios
  '241748771473-7rfda2grc8f7p099bmf98en0q9bcvp18.apps.googleusercontent.com',
];

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
  email: string
) {
  model.scan({ email: { eq: email } }).exec((err, data) => {
    if (err) {
      res.status(err.statusCode || 500).send({ err: err.message });
    } else if (data?.length) {
      const { id, active } = data[0].toJSON();
      const userPayload = {
        id,
        userType: getUserType(table),
      };
      if (table === 'Riders' && !active) {
        res.status(400).send({ err: 'User not active' });
      } else {
        res
          .status(200)
          .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
      }
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
            res
              .status(200)
              .send({ jwt: jwt.sign(userPayload, process.env.JWT_SECRET!) });
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
  let { userInfo, table } = req.body;
  if (typeof userInfo !== 'object') userInfo = JSON.parse(userInfo);
  const model = getModel(table);
  try {
    const email = userInfo?.email;
    if (model && email) {
      findUserAndSendToken(res, model, table, email);
    } else if (!model) {
      res.status(400).send({ err: 'Table not found' });
    } else if (!email) {
      res.status(400).send({ err: 'Email not found' });
    } else {
      res.status(400).send({ err: 'Payload not found' });
    }
  } catch (err: any) {
    res.status(500).send({ err: err.message });
  }
});

export default router;
