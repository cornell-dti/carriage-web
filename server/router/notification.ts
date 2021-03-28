import express, { Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Condition } from 'dynamoose/dist/Condition';
import webpush from 'web-push';
import { Notification, NotificationType } from '../models/notification';
import * as db from './common';

import { validateUser } from '../util';
import { webpushValues } from '../config';
// TODO no user validation

const router = express.Router();
const tableName = 'Notifications';

webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private,
);
type PushSub = webpush.PushSubscription;

// const subscriptionSet = new Set() as Set<PushSub>;

router.get('/', (req, res) => {
  db.getAll(res, Notification, tableName);
});


type Payload = {
  title: string;
  body: string;
};

const deleteSubscription = (endpoint: String) => {
  const condition = new Condition().where('endpoint').eq(endpoint);
  Notification.scan(condition).exec((err, data) => {
    if (err || !data) {
      return -1;
    }
    let promiseChain: Promise<void> = Promise.resolve();
    for (const el of data) {
      promiseChain = promiseChain.then(() => el.delete());
    }
    promiseChain
      .then(() => 0).catch(() => -1);
    return -1;
  });
};

const triggerPushMsg = (subscription: PushSub, payload: Payload) => {
  webpush
    .sendNotification(subscription, JSON.stringify(payload))
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.log('deleting');
        deleteSubscription(subscription.endpoint);
      } else {
        console.log(err.stack);
      }
    });
};

// subscribe a client
router.post('/subscribe', (req, res) => {
  const { endpoint, keys: { p256dh, auth } } = req.body;

  const notification = new Notification({
    id: uuid(),
    endpoint,
    p256dh,
    auth,
  });

  const subscription = {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
  };

  Promise.resolve().then(() => deleteSubscription(endpoint))
    .then(() => triggerPushMsg(subscription, {
      title: 'Hello!',
      body: 'You are subscribed.',
    })).then(() => {
      db.create(res, notification);
    })
    .catch(() => {
      res.status(500).send({ err: 'Could not subscribe' });
    });
});

// send out a notification
router.post('/send', (req, res) => {
  const { title, body } = req.body;

  db.getAll(res, Notification, tableName, (data) => {
    let promiseChain: Promise<void> = Promise.resolve();

    for (const el of data) {
      console.log(el);
      const { endpoint, p256dh, auth } = el;
      const subscription = {
        endpoint,
        keys: {
          p256dh,
          auth,
        },
      };
      promiseChain = promiseChain.then(() => triggerPushMsg(subscription, {
        title,
        body,
      }));
    }
    promiseChain
      .then(() => {
        res.status(200).send({ success: 'notifications sent' });
      })
      .catch(() => {
        res.status(500).send({ err: 'Could not send all notifications' });
      });
  });
});

export default router;
