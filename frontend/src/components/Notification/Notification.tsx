import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import { useReq } from '../../context/req';
import subscribeUser from './subscribeUser';
import styles from './notification.module.css';
import 'reactjs-popup/dist/index.css';
import { notificationBadge, notificationBell } from '../../icons/other';

type Message = {
  time: Date;
  title: string;
  body: string;
};

const Notification = () => {
  const [availability, setAvailability] = useState(true); // TODO
  const [messages, setMessages] = useState<Message[]>([]);
  const [notify, setNotify] = useState(false);
  const { withDefaults } = useReq();

  const checkNotificationAvailability = () => {
    setAvailability('serviceWorker' in navigator && 'PushManager' in window);
  };
  useEffect(checkNotificationAvailability);

  useEffect(() => {
    subscribeUser(withDefaults);
  }, [withDefaults]);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const newMsg = {
        time: new Date(event.data.time),
        title: event.data.title,
        body: event.data.body,
      };

      setMessages([newMsg, ...messages]);
      setNotify(true);
    });
  });

  const onClick = () => {
    console.log('clik');
  };

  return (
    <Popup
      trigger={
        <button className={styles.bell} onClick={onClick}>
          <span className={styles.span} />
          <img src={notificationBell} alt="notification bell icon" />
          {availability && notify && (
            <img
              src={notificationBadge}
              className={styles.badge}
              alt="notification badge icon"
            />
          )}
          {notify || <span className={styles.span} />}
        </button>
      }
      onOpen={() => setNotify(false)}
      onClose={() => setNotify(false)}
      position={['bottom right']}
      contentStyle={{
        margin: '10px',
      }}
    >
      <div className={styles.content}>
        <h6 className={styles.heading}>Message History</h6>
        {messages.map(({ time, title, body }, i) => (
          <div key={i} className={styles.body}>
            <p className={styles.date}>{time.toLocaleDateString('en-US')}</p>
            <p>{title}</p>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </Popup>
  );
};

export default Notification;
