import webpush from 'web-push';
import AWS from 'aws-sdk';
import { Condition } from 'dynamoose';
import config, { webpushValues, snsValues } from '../config';
import {
  Subscription,
  SubscriptionType,
  UserType,
  PlatformType,
} from '../models/subscription';
import { RideType, Type } from '../models/ride';
import { Change, NotificationEvent } from './types';
import { getMessage } from './notificationMsg.';
import { getReceivers } from './notificationReceivers';

AWS.config.update({ ...config, region: 'us-east-1' });
const sns = new AWS.SNS();
webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private
);

type SubscriptionRequest = {
  userType: string;
  userId: string;
  platform: string;
  token?: string;
  webSub?: webpush.PushSubscription;
  preferences?: string[];
};

const addSub = (sub: SubscriptionType) =>
  new Promise((resolve, reject) => {
    Subscription.get(sub.id, (err, data) => {
      if (err) {
        reject();
      } else if (data) {
        // TODO check add time
        resolve('success');
      } else {
        new Subscription(sub).save((err2, data2) => {
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

export const deleteAll = () =>
  new Promise((resolve, reject) => {
    Subscription.scan().exec((err, data) => {
      if (err || !data) {
        reject();
      } else {
        const promises = data.map((doc) => {
          const sub = JSON.parse(JSON.stringify(doc.toJSON()));
          return new Promise((resolve2, reject2) => {
            const { id } = sub;
            Subscription.get(id, (err2, data2) => {
              if (err2 || !data2) {
                reject2();
              } else {
                data2.delete().then(() => resolve2('good'));
              }
            });
          });
        });
        Promise.allSettled(promises).then((results) => {
          const status = results.map((el) => el.status);
          const map = status.reduce(
            (acc, el) => acc.set(el, (acc.get(el) || 0) + 1),
            new Map()
          );
          const passed = map.get('fulfilled') || 0;
          const total = (map.get('rejected') || 0) + passed;
          resolve(`${passed}/${total} passed`);
        });
      }
    });
  });

export const sendToUsers = (
  msg: string,
  userType?: UserType,
  userId?: string
) =>
  new Promise((resolve, reject) => {
    let condition = new Condition();
    if (userType) {
      condition = condition.where('userType').eq(userType);
    }
    if (userId) {
      condition = condition.where('userId').eq(userId);
    }
    Subscription.scan(condition).exec((err, data) => {
      if (err || !data) {
        reject();
      } else {
        const promises = data.map((doc) => {
          const sub = JSON.parse(JSON.stringify(doc.toJSON()));
          return sendMsg(sub, msg);
        });
        Promise.allSettled(promises).then((results) => {
          const status = results.map((el) => el.status);
          const map = status.reduce(
            (acc, el) => acc.set(el, (acc.get(el) || 0) + 1),
            new Map()
          );
          const passed = map.get('fulfilled') || 0;
          const total = (map.get('rejected') || 0) + passed;
          resolve(`${passed}/${total} passed`);
        });
      }
    });
  });

const getNotificationEvent = (body: Partial<RideType>): NotificationEvent => {
  const { status, late, type, driver } = body;
  if (status) {
    return status;
  }
  if (late) {
    return Change.LATE;
  }
  if (type === Type.ACTIVE && driver) {
    return Change.SCHEDULED;
  }
  return Change.EDITED;
};

export const notify = (
  updatedRide: RideType,
  body: Partial<RideType>,
  sender: UserType,
  change?: Change
) =>
  new Promise((resolve, reject) => {
    const riderId = updatedRide.rider.id;
    const hasDriver = Boolean(updatedRide.driver);
    const driverId = hasDriver ? updatedRide.driver!.id : '';
    const notifEvent = change || getNotificationEvent(body);
    const receivers = getReceivers(sender, notifEvent, hasDriver);

    const getNotifInfo = (receiver: UserType) =>
      JSON.stringify({
        ride: updatedRide,
        event: notifEvent,
        message: getMessage(sender, receiver, notifEvent, body),
      });

    Promise.all(
      receivers.map((receiver) => {
        let userId;
        if (receiver === UserType.DRIVER) {
          userId = driverId;
        } else if (receiver === UserType.RIDER) {
          userId = riderId;
        }
        const notifInfo = getNotifInfo(receiver);
        return sendToUsers(notifInfo, receiver, userId);
      })
    )
      .then(() => resolve(updatedRide))
      .catch(reject);
  });

export const subscribe = (req: SubscriptionRequest) =>
  new Promise((resolve, reject) => {
    const userType = req.userType as UserType;
    const { userId } = req;
    const platform = req.platform as PlatformType;
    const timeAdded = new Date().toISOString();
    if (platform === PlatformType.WEB) {
      const subscription = {
        id: req.webSub!.endpoint + userType + platform,
        endpoint: req.webSub!.endpoint,
        userType,
        userId,
        platform,
        timeAdded,
        preferences: [],
        keys: req.webSub!.keys, // TODO user id to user
      };
      addSub(subscription)
        .then(() => resolve('success'))
        .catch(reject);
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
            userId,
            platform,
            timeAdded,
            preferences: [],
          };
          addSub(subscription)
            .then(() => resolve('success'))
            .catch(reject);
        }
      });
    }
  });
