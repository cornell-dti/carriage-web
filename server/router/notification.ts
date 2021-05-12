import express from 'express';
import webpush from 'web-push';
import AWS from 'aws-sdk';
import e from 'express';
import config, { webpushValues, snsValues } from '../config';
import { Subscription, SubscriptionType, UserType, PlatformType } from '../models/subscription';
import { validateUser } from '../util';

const router = express.Router();
AWS.config.update({ ...config, region: 'us-east-1' });
const sns = new AWS.SNS();
webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private,
);


type SubscriptionRequest = {
  userType?: string;
  userId?: string;
  preferences?: string[];
  platform: string;
  token?: string;
  webSub?: webpush.PushSubscription;
};


const addSub = (sub: SubscriptionType) => new Promise((resolve, reject) => {
  Subscription.get(sub.id, (err, data) => {
    if (err) {
      reject();
    } else if (data) {
      // TODO check add time
      resolve('success');
    } else {
      (new Subscription(sub)).save((err2, data2) => {
        if (err2 || !data2) {
          reject();
        } else {
          data2.populate().then(() => resolve('success'));
        }
      });
    }
  });
});

const sendMsg = (sub: SubscriptionType, msg: string) => {
  if (sub.platform === PlatformType.WEB) {
    const webSub = {
      endpoint: sub.endpoint!,
      keys: sub.keys!,
    };
    const payload = {
      title: 'payload message',
      body: msg,
    };
    return new Promise((resolve, reject) => {
      webpush
        .sendNotification(webSub, JSON.stringify(payload))
        .then(() => resolve('success'))
        .catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            Subscription.get(sub.id, (err2, data) => {
              if (err2 || !data) {
                reject();
              } else {
                data.delete().then(() => resolve('success'));
              }
            });
          } else {
            reject(err);
          }
        });
    });
  }

  const snsParams = {
    Message: msg,
    TargetArn: sub.endpoint,
  };
  return new Promise((resolve, reject) => {
    sns.publish(snsParams, (err, data) => {
      err ? reject(err) : resolve(data); // TODO if error remove? which errors?
    });
  });
};

const subscribe = (req: SubscriptionRequest) => new Promise((resolve, reject) => {
  const userType = req.userType ? req.userType as UserType : UserType.USER;
  const platform = req.platform as PlatformType;
  const timeAdded = (new Date()).toISOString();
  if (platform === PlatformType.WEB) {
    const subscription = {
      id: req.webSub!.endpoint + userType + platform,
      endpoint: req.webSub!.endpoint,
      userType,
      platform,
      timeAdded,
      preferences: [],
      keys: req.webSub!.keys, // TODO user id to user
    };
    addSub(subscription).then(() => resolve('success')).catch(reject);
  } else {
    const snsParams = {
      Token: req.token!,
      PlatformApplicationArn: snsValues.android,
    };
    sns.createPlatformEndpoint(snsParams, (err, data) => {
      if (err || !data) {
        reject();
      } else {
        const subscription = {
          id: data.EndpointArn + userType + platform,
          endpoint: data.EndpointArn!,
          userType,
          platform,
          timeAdded,
          preferences: [],
        };
        addSub(subscription).then(() => resolve('success')).catch(reject);
      }
    });
  }
});

// send out a notification to everyone
router.post('/sendAll', (req, res) => {
  const { msg } = req.body; // TODO validation, error codes
  Subscription.scan().exec((err, data) => {
    if (err || !data) {
      res.status(400).send({ err: 'could not get all subscriptions' });
    } else {
      const promises = data.map((doc) => {
        const sub = JSON.parse(JSON.stringify(doc.toJSON()));
        return sendMsg(sub, msg);
      });
      Promise.allSettled(promises)
        .then((results) => {
          const status = results.map((el) => el.status);
          const map = status.reduce((acc, el) => acc.set(el, (acc.get(el) || 0) + 1), new Map());
          const passed = map.get('fulfilled') || 0;
          const total = (map.get('rejected') || 0) + passed;
          res.status(200).send({ success: `${passed}/${total} passed` });
        })
        .catch(() => {
          res.status(500).send({ err: 'failed to send messages' });
        });
    }
  });
});

// subscribe a user
router.post('/subscribe', validateUser('User'), (req, res) => {
  const { platform } = req.body;
  if (platform !== PlatformType.WEB && platform !== PlatformType.ANDROID) {
    res.status(400).json({ err: 'invalid platform' });
    return; // TODO additional validation
  }

  // TODO user and preferences
  const subReq = {
    platform,
    ...(platform === PlatformType.WEB
      ? { webSub: req.body.webSub } : { token: req.body.token }),
  };
  subscribe(subReq)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(() => res.status(400).json({ err: 'subscribing failed' }));
});

export default router;
