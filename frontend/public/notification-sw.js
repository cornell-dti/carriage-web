/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  let data = {
    title: 'default title',
    body: 'default body',
  };
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
  };
  if (Notification.permission === 'granted') {
    self.clients.matchAll().then((clientList) => {
      let show = clientList.length > 0;
      for (const client of clientList) {
        if (client.visibilityState === 'visible') {
          show = false;
        }
        client.postMessage({
          title: data.title,
          body: data.body,
          time: new Date().toString(),
        });
      }
      if (show) {
        self.registration.showNotification(data.title, options);
      }
    });
  } else {
    console.log('needs permission');
  }
});
