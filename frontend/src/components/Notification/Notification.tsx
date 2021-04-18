import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Popup from 'reactjs-popup';
import cn from 'classnames';
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
  const [newMessages, setNewMessages] = useState<Message[]>([]);
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

      setNewMessages([newMsg, ...newMessages]);
      setNotify(true);
    });
  });

  const mapMessages = (msgs: Message[]) => msgs.map(({ time, title, body }, i) => (
    <div key={i} className={styles.body}>
      <div className={styles.user}>
        <div className={styles.avatar}>
          <span className={styles.initials}>T</span>
        </div>
      </div>
      <div className={styles.msg}>
        <p className={styles.date}>{moment(time).format('MMMM Do')}</p>
        <p>{title} - {body}</p>
      </div>
      <div className={styles.link}>View</div>
    </div>
  ));

  return (
    <Popup
      trigger={
        <button className={styles.bell}>
          <img src={notificationBell} alt='notification bell icon' />
          {availability && notify && (
            <img
              src={notificationBadge}
              className={styles.badge}
              alt="notification badge icon"
            />
          )}
        </button>
      }
      onClose={() => {
        setMessages([...newMessages, ...messages]);
        setNewMessages([]);
        setNotify(false);
      }}
      position={['bottom right']}
      contentStyle={{
        margin: '10px',
        width: '333px',
      }}
    >
      <div className={styles.content}>
        {newMessages.length === 0
          || <h6 className={cn(styles.heading, styles.divider)}>
            You have {newMessages.length} new message{newMessages.length === 1 || 's'}
          </h6>
        }
        {newMessages.length === 0
          || mapMessages(newMessages)}
        {messages.length === 0
          || <h6 className={styles.heading}>Message History</h6>}
        {messages.length === 0
          || mapMessages(messages)}
      </div>
    </Popup>
  );
};

export default Notification;
