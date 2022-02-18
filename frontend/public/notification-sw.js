/* eslint-disable no-restricted-globals */

// Try making the service worker immediately claim the page
self.addEventListener('install', (event) =>
  event.waitUntil(self.skipWaiting())
);
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener('notificationclick', () => {
  // navigates to client
  self.clients.matchAll().then((clis) => {
    const client = clis.find((c) => c.visibilityState === 'visible');
    if (client !== undefined) {
      client.navigate('some_url');
      client.focus();
    } else {
      // there are no visible windows. Open one.
      self.clients.openWindow('some_url');
      self.notification.close();
    }
  });
  // close all notifications
  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => {
      notification.close();
    });
  });
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'default title',
    body: 'default body',
  };
  if (event.data) {
    data = event.data.json();
    console.log(data);
  }

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      reg.showNotification(data.title, {
        body: data.body,
      });
    });
  }

  // if (Notification.permission === 'granted') {
  //   self.clients.matchAll().then((c) => {
  //     if (c.length === 0) {
  //       // Show notification
  //       return navigator.serviceWorker.getRegistration().then((reg) => {
  //         return reg.showNotification(data.title, {
  //           body: data.body,
  //         });
  //       });
  //     } else {
  //       // Send a message to the page to update the UI
  //       c.forEach((client) => {
  //         client.postMessage(data);
  //       });
  //     }
  //   });
  // } else {
  //   console.log('notification needs permission');
  // }
});
