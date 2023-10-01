import axios from '../../util/axios';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const convertedVapidKey = urlBase64ToUint8Array(
  process.env.REACT_APP_PUBLIC_VAPID_KEY!
);

type WithDefaultsType = (options?: RequestInit) => RequestInit;

const sendSubscription = (
  userType: string,
  userId: string,
  sub: PushSubscription
) => {
  const subscription = {
    userType,
    userId,
    platform: 'web',
    webSub: sub,
  };
  axios.post('/api/notification/subscribe', subscription);
};

const subscribeUser = (userType: string, userId: string) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if (!registration.pushManager) {
          // 'Push manager unavailable.'
          return;
        }

        registration.pushManager
          .getSubscription()
          .then((existedSubscription) => {
            if (existedSubscription === null) {
              // 'No subscription detected, make a request.'
              registration.pushManager
                .subscribe({
                  applicationServerKey: convertedVapidKey,
                  userVisibleOnly: true,
                })
                .then((newSubscription) => {
                  // 'New subscription added.'
                  sendSubscription(userType, userId, newSubscription);
                })
                .catch((e) => {
                  if (Notification.permission !== 'granted') {
                    // 'Permission was not granted.'
                    alert('Please allow notifications to receive notifications.');
                  } else {
                    alert('An error ocurred during the subscription process. Please contact the administrator for help.');
                  }
                });
            } else {
              // 'Existed subscription detected.'
              // sending anyway right now
              sendSubscription(userType, userId, existedSubscription);
            }
          });
      })
      .catch((e) => {
        // 'An error ocurred during Service Worker registration.'
      });
  }
};

export default subscribeUser;
