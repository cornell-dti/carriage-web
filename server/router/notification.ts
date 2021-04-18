import express from 'express';
import webpush from 'web-push';
import AWS from 'aws-sdk';
import config, { webpushValues, snsValues } from '../config';
import { validateUser } from '../util';

const router = express.Router();
AWS.config.update(config);
const sns = new AWS.SNS();
webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private,
);
type WebSub = webpush.PushSubscription;


type Subscription = {
  // TODO user id
  platform: string;
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
};

type SubscriptionRequest = {
  platform: string;
  token?: string;
  webSub?: WebSub;
};

const subscriptionSet = new Set() as Set<string>;

const badPlatform =  (platform : String) => {
  switch (platform) {
    case 'web':
    case 'android':
    case 'ios':
    case 'ios rider':
    case 'ios driver':
      return false;
    default:
      return true;
  }
  
}

const sendMsg = (sub: Subscription, msg: string) => {
  if (sub.platform === 'web') {
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
        .then(resolve)
        .catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            subscriptionSet.delete(JSON.stringify(sub));
          } else {
            reject(err);
          }
        });
    });
  }

  const ios = sub.platform !== 'android';
  const payloadKey = ios ? 'APNS' : 'GCM';
  const payload = ios
    ? { aps: { alert: msg } }
    : { notification: { text: msg } };
  const snsParams = {
    Message: JSON.stringify({ [payloadKey]: payload }),
    TargetArn: sub.endpoint,
    MessageStructure: 'json',
  };
  return new Promise((resolve, reject) => {
    sns.publish(snsParams, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
};

const subscribe = (req: SubscriptionRequest) => {
  const plat = req.platform;
  if (plat === 'web') {
    const subscription = {
      platform: plat,
      endpoint: req.webSub!.endpoint,
      keys: req.webSub!.keys,
    };
    subscriptionSet.add(JSON.stringify(subscription));
    return new Promise((resolve, reject) => {
      resolve('success');
    });
  }

  const ios = plat === 'ios rider' ? snsValues.ios_rider : snsValues.ios_driver;
  const arn = plat === 'android' ? snsValues.android : ios;
  const snsParams = {
    Token: req.token!,
    PlatformApplicationArn: arn,
  };
  return new Promise((resolve, reject) => {
    sns.createPlatformEndpoint(snsParams, (err, data) => {
      if (err) reject(err);

      const subscription = {
        platform: plat,
        endpoint: data.EndpointArn,
      };
      subscriptionSet.add(JSON.stringify(subscription));
      resolve('success');
    });
  });
};

// send out a notification to everyone
router.post('/sendAll', (req, res) => {
  const { msg } = req.body; // TODO validation, error codes

  const promises = [...subscriptionSet].map((strSub) => {
    const sub = JSON.parse(strSub);
    return sendMsg(sub, msg);
  });
  Promise.all(promises)
    .then((data) => {
      res.status(200).send({ success: true });
    })
    .catch((err) => {
      res.status(500).send({ err: 'could not send all messages' });
    });
});

// subscribe a user
router.post('/subscribe', validateUser('User'), (req, res) => {
  if (badPlatform(req.body.platform)) {
    res.status(400).json({ err: 'invalid platform' });
    return; // TODO additional validation
  }

  const subReq = req.body.platform === 'web'
    ? { platform: req.body.platform, webSub: req.body.webSub }
    : { platform: req.body.platform, token: req.body.token };
  subscribe(subReq)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(() => res.status(400).json({ err: 'subscribing failed' }));
});

export default router;
