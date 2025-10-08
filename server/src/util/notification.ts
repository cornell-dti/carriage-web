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
import { sendApprovedEmail, sendRejectedEmail } from "../mailer"; // your AppSMTP mailer
import { SchedulingState } from "../models/ride";
import { Rider } from "../models/rider";

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

// Helper function to fetch rider emails from rider IDs
const fetchRiderEmails = async (riderIds: string[]): Promise<string[]> => {
  if (riderIds.length === 0) return [];
  
  try {
    console.log('📧 EMAIL: Fetching emails for rider IDs:', riderIds);
    const riders = await Promise.all(
      riderIds.map(async (riderId) => {
        try {
          const rider = await Rider.get(riderId);
          return rider ? rider.email : null;
        } catch (error) {
          console.error(`📧 EMAIL: Failed to fetch rider ${riderId}:`, error);
          return null;
        }
      })
    );
    
    const emails = riders.filter((email): email is string => Boolean(email));
    console.log('📧 EMAIL: Fetched rider emails:', emails);
    return emails;
  } catch (error) {
    console.error('📧 EMAIL: Error fetching rider emails:', error);
    return [];
  }
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
    const riderIds = updatedRide.riders?.map((rider) => {
      if (typeof rider === 'string') {
        return rider; // Already an ID
      } else if (rider && typeof rider === 'object' && rider.id) {
        return rider.id; // Extract ID from rider object
      }
      return undefined;
    }).filter((id): id is string => Boolean(id)) || [];
    
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
    .then(async () => {
      console.log('📧 EMAIL: Starting email automation...');
      console.log('📧 EMAIL: Scheduling State:', updatedRide.schedulingState);
      
      // Send emails based on scheduling state
      try {
        const rideDetails = {
          pickup: updatedRide.startLocation?.name || 'Unknown location',
          dropoff: updatedRide.endLocation?.name || 'Unknown location',
          time: new Date(updatedRide.startTime),
          modified: change === Change.EDITED,
        };
        
        console.log('📧 EMAIL: Ride Details:', rideDetails);
        
        // Extract rider emails - handle both string IDs and populated objects
        let riderEmails: string[] = [];
        
        // Check if riders are string IDs or populated objects
        const hasStringIds = updatedRide.riders && updatedRide.riders.length > 0 && typeof updatedRide.riders[0] === 'string';
        
        if (hasStringIds) {
          // Riders are string IDs, fetch emails from database
          const stringRiderIds = updatedRide.riders as unknown as string[];
          riderEmails = await fetchRiderEmails(stringRiderIds);
        } else {
          // Riders are populated objects, extract emails directly
          riderEmails = (updatedRide.riders || [])
            .map((r) => {
              if (r && typeof r === 'object' && r.email) {
                return r.email;
              }
              return undefined;
            })
            .filter((email): email is string => Boolean(email));
        }

        console.log('📧 EMAIL: Rider Emails:', riderEmails);

        if (riderEmails.length === 0) {
          console.log('📧 EMAIL: No rider emails found, skipping email sending');
          resolve(updatedRide);
          return;
        }

        // Send emails to all riders
        const emailPromises = riderEmails.map(async (email) => {
          try {
            console.log(`📧 EMAIL: Attempting to send email to ${email}...`);
            if (updatedRide.schedulingState === SchedulingState.SCHEDULED) {
              console.log(`📧 EMAIL: Sending APPROVAL email to ${email}`);
              await sendApprovedEmail(email, rideDetails);
              console.log(`📧 EMAIL: ✅ Approval email sent successfully to ${email}`);
            } else if (updatedRide.schedulingState === SchedulingState.REJECTED) {
              console.log(`📧 EMAIL: Sending REJECTION email to ${email}`);
              await sendRejectedEmail(email, rideDetails);
              console.log(`📧 EMAIL: ✅ Rejection email sent successfully to ${email}`);
            } else {
              console.log(`📧 EMAIL: ⏭️  Skipping email to ${email} - scheduling state is ${updatedRide.schedulingState}`);
            }
          } catch (emailError) {
            console.error(`📧 EMAIL: ❌ Failed to send email to ${email}:`, emailError);
            // Don't throw here - we want to continue with other emails
          }
        });

        await Promise.allSettled(emailPromises);
        console.log('📧 EMAIL: Email automation completed');
        resolve(updatedRide);
      } catch (error) {
        console.error('📧 EMAIL: ❌ Error in email automation:', error);
        // Still resolve the notification even if emails fail
        resolve(updatedRide);
      }
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
