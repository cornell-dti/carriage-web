import React from 'react';
import styles from './notification.module.css';
import moment from 'moment';
import { useState } from 'react';
import { notificationBadge } from '../../icons/other';

type Message = {
  key: number;
  time: Date;
  title: string;
  body: string;
  read: boolean;
  markAsRead: (key: number) => void;
};

const truncate = (str: string) => {
  if (str.length <= 30) {
    return str;
  }
  return `${str.slice(0, 30)}...`;
};

const DisplayMessage = ({
  key,
  time,
  title,
  body,
  read,
  markAsRead,
}: Message) => {
  const [trunc, setTrunc] = useState<boolean>(body.length > 30);
  const [viewed, setViewed] = useState<boolean>(read);
  const onViewClick = () => {
    setViewed(true);
    markAsRead(key);
    setTrunc((prev) => !prev);
  };
  return (
    <div key={key} className={styles.body}>
      {viewed ? null : (
        <img
          src={notificationBadge}
          className={styles.messageBadge}
          alt="notification badge"
        />
      )}
      <div className={styles.user}>
        <div className={styles.avatar}>
          <span className={styles.initials}>{title.slice(0, 1)}</span>
        </div>
      </div>
      <div className={styles.msg}>
        <p className={styles.date}>{moment(time).format('MMMM Do')}</p>
        <p>{trunc ? truncate(body) : body}</p>
      </div>
      <div className={styles.link} onClick={onViewClick}>
        {trunc ? 'View More' : 'Less'}
      </div>
    </div>
  );
};

export default DisplayMessage;
