import { parseAddress } from 'addresser';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserType, JWTPayload } from './types';
import moment from 'moment-timezone';
import { ValueType } from 'dynamoose/dist/Schema';
import { Location } from '../models/location';
import { Admin } from '../models/admin';
import { Driver } from '../models/driver';
import { Rider } from '../models/rider';

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

export const timeToMDY = (time: string) => moment(time).format('l');

export const timeTo12Hr = (time: string) => moment(time).format('LT');

export const getRideLocation = (value: ValueType) => {
  if (typeof value === 'string') {
    return Location.get(value) as any;
  }
  return value;
};

type Role = 'rider' | 'driver' | 'admin';

export async function checkNetIDExists(
  email: string,
  role: Role
): Promise<boolean> {
  if (role === 'rider') {
    const riders = await Rider.scan('email').eq(email).exec();
    return riders.length > 0;
  }

  if (role === 'driver') {
    const [drivers, admins] = await Promise.all([
      Driver.scan('email').eq(email).exec(),
      Admin.scan('email').eq(email).exec(),
    ]);
    return drivers.length > 0 || admins.length > 0;
  }

  const [admins, drivers] = await Promise.all([
    Admin.scan('email').eq(email).exec(),
    Driver.scan('email').eq(email).exec(),
  ]);

  return admins.length > 0 || drivers.length > 0
}

export async function checkNetIDExistsForOtherEmployee(
  email: string,
  currentEmployeeId: string
): Promise<boolean> {
  const [admins, drivers, riders] = await Promise.all([
    Admin.scan('email').eq(email).exec(),
    Driver.scan('email').eq(email).exec(),
    Rider.scan('email').eq(email).exec(),
  ]);

  // Check if any found employee has a different ID
  const allEmployees = [...admins, ...drivers, ...riders];
  return allEmployees.some(emp => emp.id !== currentEmployeeId);
}