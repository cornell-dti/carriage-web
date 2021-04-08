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
    // TODO icon, tag, etc.
  };
  if (Notification.permission === 'granted') {
    event.waitUntil(self.registration.showNotification(data.title, options));

    let promiseChain = Promise.resolve();

    // TODO if client is focused
    promiseChain = promiseChain.then(() => {
      self.clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            title: data.title,
            body: data.body,
            time: new Date().toString(),
          });
        }
      });
    });

    event.waitUntil(promiseChain);
  } else {
    console.log('needs permission');
  }
});
