import express from 'express';
import { PlatformType } from '../models/subscription';
import { validateUser } from '../util';
import { subscribe } from '../util/notification';

const router = express.Router();

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
