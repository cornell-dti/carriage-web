import React, { useState, useEffect } from 'react';
import { useId } from '@react-aria/utils';
import moment from 'moment';
import Popup from 'reactjs-popup';
import cn from 'classnames';
import styles from './notification.module.css';
import 'reactjs-popup/dist/index.css';
import { notificationBadge, notificationBell } from '../../icons/other';
import { RideType } from '@carriage-web/shared/src/types/ride';

type Message = {
  time: Date;
  title: string;
  body: string;
};

type NotificationData = {
  title: string;
  body: string;
  ride: RideType;
  sentTime: string;
};

const truncate = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return `${str.slice(0, num)}...`;
};

const Notification = () => {
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notify, setNotify] = useState(false);
  const popupId = useId();
  const [isNotifOpen, setIsNotifOpen] = useState(true);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { body, ride, sentTime, title }: NotificationData = event.data;
      const newMsg = {
        time: new Date(sentTime),
        title,
        body,
        day: ride.startTime,
      };
      setNewMessages([newMsg, ...newMessages]);
      setNotify(true);
    });
  }, []);

  const mapMessages = (msgs: Message[]) =>
    msgs.map(({ time, title, body }, i) => (
      <div key={i} className={styles.body}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            <span className={styles.initials}>C</span>
          </div>
        </div>
        <div className={styles.msg}>
          <p className={styles.date}>{moment(time).format('MMMM Do')}</p>
          <p>{body}</p>
        </div>
        <div className={styles.link}>View</div>
      </div>
    ));

  useEffect(() => {
    const element = document.getElementById(popupId);
    element?.removeAttribute('aria-describedby');
  }, []);

  return (
    <Popup
      trigger={
        <button
          id={popupId}
          aria-expanded={isNotifOpen}
          className={styles.bell}
        >
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
      onOpen={() => {
        setIsNotifOpen(true);
      }}
      onClose={() => {
        setMessages([...newMessages, ...messages]);
        setNewMessages([]);
        setNotify(false);
        setIsNotifOpen(false);
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
