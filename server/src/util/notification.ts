import webpush from 'web-push';
import {
  PublishCommandInput,
  SNS,
  CreatePlatformEndpointCommandOutput,
} from '@aws-sdk/client-sns';
import { Condition } from 'dynamoose';
import { v4 as uuid } from 'uuid';
import config, { webpushValues, snsValues } from '../config';
import {
  Subscription,
  SubscriptionType,
  UserType,
  PlatformType,
} from '../models/subscription';
import { RideType, Type } from '../models/ride';
import { Change, NotificationEvent } from './types';
import { getMessage } from './notificationMsg';
import { getReceivers } from './notificationReceivers';

const snsClient = new SNS({
  credentials: {
    accessKeyId: config.accessKeyId as string,
    secretAccessKey: config.secretAccessKey as string,
  },
  region: 'us-east-1',
});

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

const sendMsg = (
  sub: SubscriptionType,
  title: string,
  body: string,
  notifEvent: NotificationEvent,
  ride: RideType
) => {
  if (sub.platform === PlatformType.WEB) {
    const webSub = {
      endpoint: sub.endpoint!,
      keys: sub.keys!,
    };
    const payload = {
      title,
      body,
      ride,
      sentTime: new Date().toISOString(),
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

  const payload = JSON.stringify({
    default: 'Default message.',
    GCM: JSON.stringify({
      priority: 'high',
      content_available: true,
      data: {
        id: uuid(),
        notifEvent,
        ride,
        sentTime: new Date().toISOString(),
      },
      notification: {
        title,
        body,
      },
    }),
    APNS: JSON.stringify({
      payload: {
        aps: {
          sound: 'default',
        },
      },
    }),
  });

  const snsParams: PublishCommandInput = {
    Message: payload,
    MessageStructure: 'json',
    TargetArn: sub.endpoint,
  };

  return new Promise((resolve, reject) => {
    snsClient.publish(snsParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
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
          const sub = doc.toJSON();
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
  title: string,
  body: string,
  notifEvent: NotificationEvent,
  ride: RideType,
  receiver: UserType,
  userId?: string
) =>
  new Promise((resolve, reject) => {
    let condition = new Condition();
    if (receiver) {
      condition = condition.where('userType').eq(receiver);
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
          return sendMsg(sub, title, body, notifEvent, ride);
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

export const getNotificationEvent = (
  body: Partial<RideType>
): NotificationEvent => {
  const { status, type, driver } = body;
  if (status) {
    return status;
  }
  if (type === Type.ACTIVE && driver) {
    return Change.SCHEDULED;
  }
  if (driver) {
    return Change.REASSIGN_DRIVER;
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
    // Handle multiple riders - collect all rider IDs
    // Riders can be either string IDs or full rider objects
    const riderIds =
      updatedRide.riders
        ?.map((rider) => {
          if (typeof rider === 'string') {
            return rider; // Already an ID
          } else if (rider && typeof rider === 'object' && rider.id) {
            return rider.id; // Extract ID from rider object
          }
          return undefined;
        })
        .filter((id): id is string => Boolean(id)) || [];

    const hasDriver = Boolean(updatedRide.driver);
    const driverId = hasDriver ? updatedRide.driver!.id : '';
    const notifEvent = change || getNotificationEvent(body);
    const receivers = getReceivers(sender, notifEvent, hasDriver);
    console.log('🔔 NOTIFY: Rider IDs:', riderIds);
    console.log('🔔 NOTIFY: Has Driver:', hasDriver);
    console.log('🔔 NOTIFY: Notification Event:', notifEvent);

    Promise.all(
      receivers.flatMap((receiver) => {
        if (receiver === UserType.DRIVER) {
          const userId = driverId;
          const title = 'Carriage'; // placeholder
          const body = getMessage(sender, receiver, notifEvent, updatedRide);
          return sendToUsers(
            title,
            body,
            notifEvent,
            updatedRide,
            receiver,
            userId
          );
        } else if (receiver === UserType.RIDER) {
          // Send notifications to all riders
          return riderIds.map((riderId) => {
            const title = 'Carriage'; // placeholder
            const body = getMessage(sender, receiver, notifEvent, updatedRide);
            return sendToUsers(
              title,
              body,
              notifEvent,
              updatedRide,
              receiver,
              riderId
            );
          });
        }
        return [];
      })
    )
      .then(() => {
        // Push notifications sent successfully
        resolve(updatedRide);
      })
      .catch(reject);
  });

// export const subscribe = (req: SubscriptionRequest) =>
//   new Promise((resolve, reject) => {
//     const userType = req.userType as UserType;
//     const { userId } = req;
//     const platform = req.platform as PlatformType;
//     const timeAdded = new Date().toISOString();
//     if (platform === PlatformType.WEB) {
//       const subscription = {
//         id: req.webSub!.endpoint + userType + platform,
//         endpoint: req.webSub!.endpoint,
//         userType,
//         userId,
//         platform,
//         timeAdded,
//         preferences: [],
//         keys: req.webSub!.keys, // TODO user id to user
//       };
//       addSub(subscription)
//         .then(() => resolve('success'))
//         .catch(reject);
//     } else {
//       const snsParams = {
//         Token: req.token!,
//         PlatformApplicationArn: snsValues.android,
//       };
//       snsClient.createPlatformEndpoint(snsParams, (err, data) => {
//         if (err || !data) {
//           reject();
//         } else {
//           const subscription = {
//             id: data.EndpointArn + userType + platform,
//             endpoint: data.EndpointArn!,
//             userType,
//             userId,
//             platform,
//             timeAdded,
//             preferences: [],
//           };
//           addSub(subscription)
//             .then(() => resolve('success'))
//             .catch(reject);
//         }
//       });
//     }
//   });

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

      snsClient.createPlatformEndpoint(
        snsParams,
        (
          err: Error | null,
          data: CreatePlatformEndpointCommandOutput | undefined
        ) => {
          if (err || !data) {
            reject(err);
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
        }
      );
    }
  });
