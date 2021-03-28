import express from 'express';
import webpush from 'web-push';
import { webpushValues } from '../config';
import { validateUser } from '../util';

const router = express.Router();

webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private,
);
type PushSub = webpush.PushSubscription;

const subscriptionSet = new Set() as Set<string>;

type Payload = {
  title: string;
  body: string;
};

const triggerPushMsg = (subscription: PushSub, payload: Payload) => webpush
  .sendNotification(subscription, JSON.stringify(payload))
  .catch((err) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      subscriptionSet.delete(JSON.stringify(subscription));
    } else {
      console.log(err.stack);
    }
  });

// send out a notification
router.post('/send', (req, res) => {
  const { title, body } = req.body; // TODO validation, error codes

  let promiseChain: Promise<void | webpush.SendResult> = Promise.resolve();

  for (const subscription of subscriptionSet) {
    promiseChain = promiseChain.then((webpushResult) => triggerPushMsg(JSON.parse(subscription), {
      title,
      body,
    }));
  }
  promiseChain
    .then(() => {
      res.status(200).send({ success: true });
    })
    .catch(() => res.status(500).send({ err: 'could not send all messages' }));
});

// subscribe a client
router.post('/subscribe', validateUser('User'), (req, res) => {
  const { endpoint, keys: { p256dh, auth } } = req.body;
  const currentSubscriber = { endpoint, keys: { p256dh, auth } };

  subscriptionSet.add(JSON.stringify(currentSubscriber));

  triggerPushMsg(currentSubscriber, {
    title: 'Hello!',
    body: 'You are subscribed.',
  })
    .then(() => res.status(200).json({ success: true }))
    .catch(() => res.status(400).json({ err: 'subscribing failed' }));
});

export default router;
