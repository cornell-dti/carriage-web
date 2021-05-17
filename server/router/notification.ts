import express from 'express';
import { PlatformType } from '../models/subscription';
import { validateUser } from '../util';
import { subscribe, sendToUsers } from '../util/notification';

const router = express.Router();

// send out a notification to everyone
router.post('/sendAll', validateUser('User'), (req, res) => {
  const { msg } = req.body; // TODO validation, error codes
  sendToUsers(msg)
    .then((passed) => res.status(200).send({ success: passed }))
    .catch(() => res.status(500).send({ err: 'failed to send messages' }));
});

// subscribe a user
router.post('/subscribe', validateUser('User'), (req, res) => {
  const { platform, userType, userId } = req.body;
  if (platform !== PlatformType.WEB && platform !== PlatformType.ANDROID) {
    res.status(400).json({ err: 'invalid platform' });
    return; // TODO additional validation
  }

  // TODO user and preferences
  const subReq = {
    platform,
    ...(platform === PlatformType.WEB
      ? { webSub: req.body.webSub }
      : { token: req.body.token }),
    userType,
    userId,
  };
  subscribe(subReq)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(() => res.status(400).json({ err: 'subscribing failed' }));
});

export default router;
