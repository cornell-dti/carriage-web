import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const withAuth = (req: Request, res: Response, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('No token');
  } else {
    jwt.verify(token, process.env.JWT_SECRET || "", (err: any, decoded: any) => {
      if (err) {
        res.status(401).send('Invalid token');
        console.log(res);
      } else {
        // this middleware does not do all that is desired yet
        // maybe split it into multiple middlewares, each one handling a particular type of request
        req.body['id'] = decoded['id'];
        next();
      }
    });
  }
}

export default withAuth;