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
  process.env.REACT_APP_PUBLIC_VAPID_KEY!,
);

type WithDefaultsType = (options?: RequestInit | undefined) => RequestInit;

const sendSubscription = (subscription: any, withDefaults: WithDefaultsType) => fetch('/api/notification/subscribe', withDefaults({
  method: 'POST',
  body: JSON.stringify(subscription),
}));

const subscribeUser = (withDefaults: WithDefaultsType) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if (!registration.pushManager) {
          console.log('Push manager unavailable.');
          return;
        }

        registration.pushManager
          .getSubscription()
          .then((existedSubscription) => {
            if (existedSubscription === null) {
              console.log('No subscription detected, make a request.');
              registration.pushManager
                .subscribe({
                  applicationServerKey: convertedVapidKey,
                  userVisibleOnly: true,
                })
                .then((newSubscription) => {
                  console.log('New subscription added.');
                  sendSubscription(newSubscription, withDefaults);
                })
                .catch((e) => {
                  if (Notification.permission !== 'granted') {
                    console.log('Permission was not granted.');
                  } else {
                    console.error(
                      'An error ocurred during the subscription process.',
                      e,
                    );
                  }
                });
            } else {
              console.log('Existed subscription detected.');
              sendSubscription(existedSubscription, withDefaults);
            }
          });
      })
      .catch((e) => {
        console.error(
          'An error ocurred during Service Worker registration.',
          e,
        );
      });
  }
};

export default subscribeUser;
