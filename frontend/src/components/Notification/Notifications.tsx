import React, { useState, useEffect } from 'react';

import { useReq } from '../../context/req';
import subscribeUser from './subscribeUser';
// TODO permission UX

type Message = {
  title: string,
  body: string,
  time: string,
}

const Notifications = () => {
  const [availability, setAvailability] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { withDefaults } = useReq();

  // TODO proper checks
  const checkNotificationAvailability = () => {
    setAvailability('serviceWorker' in navigator && 'PushManager' in window);
  };

  useEffect(checkNotificationAvailability);

  useEffect(() => { subscribeUser(withDefaults); }, [withDefaults]);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      setMessages([event.data, ...messages]);
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
      { messages.map(({ title, body }, i) => (<div key={i}><p>{title}</p><p>{body}</p><p>----------</p></div>))}
    </div>
  );
};

export default Notifications;
