import React, { useState, useEffect } from 'react';

// TODO permission UX

type Message = {
  title: string,
  body: string,
  time: string,
}

const Notifications = () => {
  const [availability, setAvailability] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // TODO proper checks
  const checkNotificationAvailability = () => {
    setAvailability('serviceWorker' in navigator && 'PushManager' in window);
  };

  useEffect(checkNotificationAvailability);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Received a message from service worker: ', event.data);
      setMessages([...messages, event.data]);
    });
  });

  return (
    <div>
      <h3>Web Push View</h3>
      <p>
        {availability
          ? 'Push messaging is supported.'
          : 'This browser does not support push messaging.'}
      </p>
      <h3>Messages</h3>
      { messages.map(({ title, body }) => (<div><p>{title}</p><p>{body}</p></div>))}
    </div>
  );
};

export default Notifications;
