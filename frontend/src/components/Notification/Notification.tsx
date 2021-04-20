import React from 'react';
import styles from './notification.module.css';
import { notificationBadge, notificationBell } from '../../icons/other';

interface NotificationProps {
  isNotified?: boolean
}

const Notification = ({ isNotified }: NotificationProps) => (
  <div className={styles.container}>
    <img src={notificationBell} className={styles.bell} alt="notification bell icon" />
    {isNotified && (
      <img src={notificationBadge} className={styles.badge} alt="notification badge icon" />
    )}
  </div>
);

export default Notification;
