import { parseAddress } from 'addresser';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserType, JWTPayload } from './types';

export function createKeys(property: string, values: string[]) {
  return values.map((v) => ({ [property]: v }));
}

export function formatAddress(address: string): string {
  let addressString;
  try {
    // type declaration in addresser is incorrect
    addressString = parseAddress(address) as any;
  } catch {
    addressString = parseAddress(`${address}, Ithaca, NY 14850`) as any;
  }
  return addressString.formattedAddress;
}

function validateToken(
  req: Request,
  res: Response,
  callback: (payload?: JWTPayload) => void,
) {
  const { authorization } = req.headers;
  if (authorization) {
    const [bearer, token] = authorization.split(' ');
    if (bearer === 'Bearer') {
      jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
        if (err) {
          res.send({ err });
        } else {
          callback(payload as JWTPayload);
        }
      });
    }
  } else {
    res.send({ err: 'No token provided' });
  }
}

function isUserValid(userType: UserType, authLevel: UserType) {
  const priority: { [type in UserType]: number } = {
    User: 0,
    Rider: 1,
    Driver: 1,
    Dispatcher: 2,
  };
  return userType === authLevel || priority[authLevel] < priority[userType];
}

export function validateUser(authLevel: UserType) {
  return (req: Request, res: Response, next: NextFunction) => {
    validateToken(req, res, (payload) => {
      if (payload) {
        const { userType } = payload;
        if (isUserValid(userType, authLevel)) {
          res.locals.user = payload;
          next();
        } else {
          res.send({ err: 'User does not have sufficient permissions' });
        }
      } else {
        res.send({ err: 'Invalid token' });
      }
    });
  };
}
