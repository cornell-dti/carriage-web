# Notifications Workflow

## Overview

The notifications workflow covers how the system sends real-time notifications to users about ride events, status updates, and system changes. The system supports both web push notifications and mobile push notifications through AWS SNS, with comprehensive message templating and user preference management.

## Notification Architecture

### Multi-Platform Support

The notification system supports two delivery channels:

1. **Web Push Notifications**: Browser-based notifications using the Web Push API
2. **Mobile Push Notifications**: Native mobile app notifications via AWS SNS

### Core Components

- **Notification Engine**: `server/src/util/notification.ts`
- **Message Templates**: `server/src/util/notificationMsg.ts`
- **Receiver Logic**: `server/src/util/notificationReceivers.ts`
- **Subscription Management**: `server/src/router/notification.ts`
- **Frontend Display**: `frontend/src/components/Notification/Notification.tsx`
- **Service Worker**: `frontend/public/notification-sw.js`

## Notification Events

### Event Types

**File**: `server/src/util/types.ts`

```typescript
export enum Change {
  CREATED = 'created',
  EDITED = 'edited',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
  REASSIGN_DRIVER = 'reassign_driver',
  LATE = 'late',
}

export enum Status {
  NOT_STARTED = 'not_started',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export type NotificationEvent = Change | Status;
```

### Event Triggers

#### Ride Lifecycle Events
- **CREATED**: New ride request created
- **EDITED**: Ride details modified
- **CANCELLED**: Ride cancelled
- **SCHEDULED**: Ride assigned to driver

#### Status Updates
- **ON_THE_WAY**: Driver en route to pickup
- **ARRIVED**: Driver arrived at pickup location
- **PICKED_UP**: Rider picked up
- **COMPLETED**: Ride completed
- **NO_SHOW**: Rider did not show up
- **LATE**: Driver running late

#### Administrative Events
- **REASSIGN_DRIVER**: Driver reassigned to ride

## Notification Receivers

### Receiver Logic

**File**: `server/src/util/notificationReceivers.ts`

The system determines notification recipients based on the event type and user role:

```typescript
export const getReceivers = (
  sender: UserType,
  notifEvent: NotificationEvent,
  hasDriver: boolean
) => {
  const receivers = [];
  
  if (sender === UserType.RIDER) {
    switch (notifEvent) {
      case Change.EDITED:
      case Status.CANCELLED:
        receivers.push(UserType.ADMIN);
        if (hasDriver) receivers.push(UserType.DRIVER);
        break;
    }
  } else if (sender === UserType.DRIVER) {
    switch (notifEvent) {
      case Change.LATE:
      case Status.NO_SHOW:
        receivers.push(UserType.RIDER);
        receivers.push(UserType.ADMIN);
        break;
      case Status.ON_THE_WAY:
      case Status.ARRIVED:
        receivers.push(UserType.RIDER);
        break;
    }
  } else {
    // Admin actions
    switch (notifEvent) {
      case Change.CREATED:
      case Change.SCHEDULED:
      case Change.EDITED:
      case Status.CANCELLED:
        receivers.push(UserType.RIDER);
        if (hasDriver) receivers.push(UserType.DRIVER);
        break;
    }
  }
  
  return receivers;
};
```

### Notification Matrix

| Event | Sender | Receivers |
|-------|--------|-----------|
| **Ride Created** | Admin | Rider + Driver (if assigned) |
| **Ride Edited** | Rider | Admin + Driver (if assigned) |
| **Ride Edited** | Admin | Rider + Driver (if assigned) |
| **Ride Cancelled** | Rider | Admin + Driver (if assigned) |
| **Ride Cancelled** | Admin | Rider + Driver (if assigned) |
| **Driver On The Way** | Driver | Rider |
| **Driver Arrived** | Driver | Rider |
| **Driver Late** | Driver | Rider + Admin |
| **No Show** | Driver | Rider + Admin |

## Message Templates

### Message Generation

**File**: `server/src/util/notificationMsg.ts`

The system generates contextual messages based on the event type, sender, and receiver:

```typescript
export const getMessage = (
  sender: UserType,
  receiver: UserType,
  notifEvent: NotificationEvent,
  ride: RideType
) => {
  switch (notifEvent) {
    case Status.ARRIVED:
      return 'Your driver is here! Meet your driver at the pickup point.';
    case Status.ON_THE_WAY:
      return 'Your driver is on the way! Wait outside to meet your driver.';
    case Status.CANCELLED:
      return getCancelledMessage(receiver, ride);
    case Change.CREATED:
      return getCreatedMessage(receiver, ride);
    case Change.EDITED:
      return getEditedMessage(sender, receiver, ride);
    case Change.LATE:
      return getLateMessage(receiver, ride);
    case Status.NO_SHOW:
      return getNoShowMessage(receiver, ride);
    case Change.SCHEDULED:
      return getScheduledMessage(receiver, ride);
    default:
      return '';
  }
};
```

### Message Examples

#### Status Updates
- **ON_THE_WAY**: "Your driver is on the way! Wait outside to meet your driver."
- **ARRIVED**: "Your driver is here! Meet your driver at the pickup point."

#### Ride Changes
- **CREATED (Rider)**: "A ride on [date] from [location] to [location] at [time] has been created."
- **CANCELLED (Rider)**: "Your ride on [date] from [location] to [location] at [time] has been cancelled."
- **EDITED (Rider)**: "Your ride information has been edited. Please review your ride info."

#### Driver Updates
- **LATE (Rider)**: "Your driver is running late! Please wait indoors."
- **NO_SHOW (Rider)**: "Your driver cancelled the ride because the driver was unable to find you."

#### Administrative Messages
- **CREATED (Driver)**: "Rides have been added to your schedule for [date]."
- **CANCELLED (Driver)**: "Rides have been removed from your schedule for [date]."

## Notification Delivery

### Web Push Notifications

#### Service Worker

**File**: `frontend/public/notification-sw.js`

The service worker handles web push notifications:

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  if (Notification.permission === 'granted') {
    self.clients.matchAll().then((c) => {
      // Send message to page for UI updates
      c.forEach((client) => {
        client.postMessage(data);
      });
      // Show browser notification
      self.registration.showNotification(data.title, data);
    });
  }
});
```

#### Notification Click Handling

```javascript
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(function (clientList) {
        // Focus existing window or open new one
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});
```

#### Web Push Payload

```typescript
const payload = {
  title: 'Carriage',
  body: messageBody,
  ride: rideData,
  sentTime: new Date().toISOString(),
};
```

### Mobile Push Notifications

#### AWS SNS Integration

**File**: `server/src/util/notification.ts`

Mobile notifications use AWS SNS with platform-specific formatting:

```typescript
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
```

#### SNS Publishing

```typescript
const snsParams: PublishCommandInput = {
  Message: payload,
  MessageStructure: 'json',
  TargetArn: sub.endpoint,
};

snsClient.publish(snsParams, (err, data) => {
  if (err) {
    reject(err);
  } else {
    resolve(data);
  }
});
```

## Subscription Management

### User Subscription

**Endpoint**: `POST /api/notification/subscribe`

**Request Body**:
```typescript
{
  platform: 'WEB' | 'ANDROID',
  userType: 'RIDER' | 'DRIVER' | 'ADMIN',
  userId: string,
  webSub?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  token?: string; // For mobile
}
```

### Subscription Processing

**File**: `server/src/util/notification.ts`

```typescript
export const subscribe = (req: SubscriptionRequest) =>
  new Promise((resolve, reject) => {
    const userType = req.userType as UserType;
    const { userId } = req;
    const platform = req.platform as PlatformType;
    
    if (platform === PlatformType.WEB) {
      const subscription = {
        id: req.webSub!.endpoint + userType + platform,
        endpoint: req.webSub!.endpoint,
        userType,
        userId,
        platform,
        timeAdded: new Date().toISOString(),
        preferences: [],
        keys: req.webSub!.keys,
      };
      addSub(subscription).then(() => resolve('success')).catch(reject);
    } else {
      // Mobile subscription via SNS
      const snsParams = {
        Token: req.token!,
        PlatformApplicationArn: snsValues.android,
      };
      
      snsClient.createPlatformEndpoint(snsParams, (err, data) => {
        if (err || !data) {
          reject(err);
        } else {
          const subscription = {
            id: data.EndpointArn + userType + platform,
            endpoint: data.EndpointArn!,
            userType,
            userId,
            platform,
            timeAdded: new Date().toISOString(),
            preferences: [],
          };
          addSub(subscription).then(() => resolve('success')).catch(reject);
        }
      });
    }
  });
```

## Frontend Notification Display

### Notification Component

**File**: `frontend/src/components/Notification/Notification.tsx`

The frontend notification component provides:

#### Real-time Updates
```typescript
useEffect(() => {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { body, ride, sentTime, title }: NotificationData = event.data;
    const newMsg = {
      time: new Date(sentTime),
      title,
      body,
      day: ride.startTime,
    };
    setNewMessages([newMsg, ...newMessages]);
    setNotify(true);
  });
}, []);
```

#### Message Display
- **New Messages**: Highlighted with badge indicator
- **Message History**: Chronological list of past notifications
- **Interactive**: Click to view ride details
- **Real-time**: Updates without page refresh

#### UI Features
- **Badge Indicator**: Shows unread message count
- **Popup Interface**: Dropdown with message list
- **Message Grouping**: New vs. historical messages
- **Responsive Design**: Works on mobile and desktop

## Error Handling and Retry Logic

### Subscription Cleanup

**File**: `server/src/util/notification.ts`

The system automatically handles expired subscriptions:

```typescript
webpush.sendNotification(webSub, JSON.stringify(payload))
  .then(() => resolve('success'))
  .catch((err) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired, remove from database
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
```

### Error Scenarios

1. **Expired Subscriptions**: Automatically removed from database
2. **Invalid Endpoints**: Graceful failure with cleanup
3. **Network Errors**: Retry logic for transient failures
4. **Permission Denied**: Fallback to in-app notifications

## Configuration

### Web Push Configuration

**File**: `server/src/config.ts`

```typescript
export const webpushValues = {
  contact: process.env.WEBPUSH_CONTACT_EMAIL,
  public: process.env.WEBPUSH_PUBLIC_KEY,
  private: process.env.WEBPUSH_PRIVATE_KEY,
};
```

### AWS SNS Configuration

```typescript
export const snsValues = {
  android: process.env.SNS_ANDROID_ARN,
  ios: process.env.SNS_IOS_ARN,
};
```

### VAPID Setup

```typescript
webpush.setVapidDetails(
  webpushValues.contact,
  webpushValues.public,
  webpushValues.private
);
```

## Current Limitations

1. **No Email Notifications**: Only push notifications supported
2. **No SMS Support**: Mobile push only, no SMS fallback
3. **Limited Preferences**: No granular notification preferences
4. **No Batching**: Individual notifications only
5. **No Analytics**: No notification delivery tracking
6. **No Scheduling**: No delayed or scheduled notifications

## Future Enhancements

1. **Email Notifications**: SMTP integration for email fallback
2. **SMS Support**: Twilio integration for SMS notifications
3. **User Preferences**: Granular notification settings
4. **Notification Batching**: Group related notifications
5. **Delivery Analytics**: Track notification success rates
6. **Rich Notifications**: Images, actions, and rich content
7. **Notification History**: Persistent notification storage
8. **Smart Scheduling**: Time-based notification delivery
9. **A/B Testing**: Test different message formats
10. **Multi-language**: Internationalization support

## Related Components

- **Notification Component**: Frontend notification display
- **Service Worker**: Web push notification handling
- **Subscription Model**: Database schema for user subscriptions
- **Notification Router**: API endpoints for subscription management
- **Message Templates**: Contextual message generation
- **Receiver Logic**: User targeting for notifications

## Dependencies

- **web-push**: Web push notification library
- **@aws-sdk/client-sns**: AWS SNS client for mobile push
- **reactjs-popup**: Frontend notification popup component
- **moment**: Date/time formatting for messages
- **dynamoose**: Database operations for subscriptions
