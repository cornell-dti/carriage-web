/* eslint-disable no-restricted-globals */

// Try making the service worker immediately claim the page
self.addEventListener('install', (event) =>
  event.waitUntil(self.skipWaiting())
);
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
      })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          console.log(client);
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

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log(data);

  if (Notification.permission === 'granted') {
    self.clients.matchAll().then((c) => {
      // Show notification
      event.waitUntil(self.registration.showNotification(data.title, data));
      // Send a message to the page to update the UI
      c.forEach((client) => {
        client.postMessage(data);
      });
    });
  } else {
    console.log('notification needs permission');
  }
});
