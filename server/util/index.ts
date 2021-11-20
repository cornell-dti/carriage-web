import { parseAddress } from 'addresser';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserType, JWTPayload } from './types';
import moment from 'moment-timezone';
import { ValueType } from 'dynamoose/dist/Schema';
import { Location } from '../models/location';

export function createKeys(property: string, values: string[]) {
  return values.map((v) => ({ [property]: v }));
}

export function isAddress(address: string) {
  let parsedAddr;
  try {
    parsedAddr = parseAddress(address);
  } catch {
    return false;
  }
  const {
    streetNumber,
    streetName,
    streetSuffix,
    placeName,
    stateName,
    zipCode,
  } = parsedAddr;
  return Boolean(
    streetNumber &&
      streetName &&
      streetSuffix &&
      placeName &&
      stateName &&
      zipCode
  );
}

export function formatAddress(address: string): string {
  let parsedAddr;
  try {
    // type declaration in addresser is incorrect
    parsedAddr = parseAddress(address) as any;
  } catch {
    parsedAddr = parseAddress(`${address}, Ithaca, NY 14850`) as any;
  }
  return parsedAddr.formattedAddress;
}

function validateToken(
  req: Request,
  res: Response,
  callback: (payload?: JWTPayload) => void
) {
  const { authorization } = req.headers;
  if (authorization) {
    const [bearer, token] = authorization.split(' ');
    if (bearer === 'Bearer') {
      jwt.verify(token || '', process.env.JWT_SECRET!, (err, payload) => {
        if (err) {
          res.status(500).send({ err: err.message });
        } else {
          callback(payload as unknown as JWTPayload);
        }
      });
    } else {
      res.status(400).send({ err: 'Invalid token format' });
    }
  } else {
    res.status(400).send({ err: 'No token provided' });
  }
}

const priority: { [type in UserType]: number } = {
  User: 0,
  Rider: 1,
  Driver: 1,
  Admin: 2,
};

function isUserValid(userType: UserType, authLevel: UserType) {
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
          res
            .status(400)
            .send({ err: 'User does not have sufficient permissions' });
        }
      } else {
        res.status(400).send({ err: 'Invalid token' });
      }
    });
  };
}

export const daysUntilWeekday = (
  start: moment.Moment,
  weekday: number
): number => {
  const startWeekday = start.day();
  let endWeekday = weekday;
  if (weekday < startWeekday) {
    endWeekday += 7;
  }
  const days = endWeekday - startWeekday;
  return days || 7;
};

export const timeToMDY = (time: string) =>
  moment.tz(time).format('l');

export const timeTo12Hr = (time: string) =>
  moment.tz(time).format('LT');

export const getRideLocation = (value: ValueType) => {
  if (typeof value === 'string') {
    return Location.get(value) as any;
  }
  return value;
};
