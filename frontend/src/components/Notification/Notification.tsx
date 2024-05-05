import React, { useState, useEffect } from 'react';
import { useId } from '@react-aria/utils';
import moment from 'moment';
import Popup from 'reactjs-popup';
import cn from 'classnames';
import styles from './notification.module.css';
import 'reactjs-popup/dist/index.css';
import { notificationBadge, notificationBell } from '../../icons/other';
import { Ride } from '../../types';
import DisplayMessage from './Message';

type Message = {
  key: number;
  time: Date;
  title: string;
  body: string;
  read: boolean;
};

type NotificationData = {
  title: string;
  body: string;
  ride: Ride;
  sentTime: string;
};

const Notification = () => {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notify, setNotify] = useState(false);
  const popupId = useId();
  const markAsRead = (key: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.key === key ? { ...message, read: true } : message
      )
    );
  };

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { body, ride, sentTime, title }: NotificationData = event.data;
      const newMsg = {
        key: newMessages.length + 1,
        time: new Date(sentTime),
        title,
        body,
        day: ride.startTime,
        read: false,
      };
      setNewMessages([newMsg, ...newMessages]);
      setNotify(true);
    });
  }, []);

  const mapMessages = (msgs: Message[]) =>
    msgs.map((message) => (
      <DisplayMessage {...message} key={message.key} markAsRead={markAsRead} />
    ));

  useEffect(() => {
    const element = document.getElementById(popupId);
    element?.removeAttribute('aria-describedby');
  }, []);

  return (
    <Popup
      trigger={
        <button id={popupId} className={styles.bell}>
          <img src={notificationBell} alt="Notifications" />
          {notify && (
            <img
              src={notificationBadge}
              className={styles.badge}
              alt="notification badge"
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
        {newMessages.length === 0 || (
          <h6 className={cn(styles.heading, styles.divider)}>
            You have {newMessages.length} new message
            {newMessages.length === 1 || 's'}
          </h6>
        )}
        {newMessages.length === 0 || mapMessages(newMessages)}
        <h6 className={styles.heading}>Message History</h6>
        {mapMessages(messages)}
      </div>
    </Popup>
  );
};

export default Notification;
