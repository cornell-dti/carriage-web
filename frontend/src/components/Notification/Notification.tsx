import React from 'react';
import styles from './notification.module.css';
import { notificationBadge, notificationBell } from '../../icons/other';

const Card = () => (
    <div className={styles.container}>
      <img src={notificationBell} className={styles.bell} alt="notification bell icon" />
      <img src={notificationBadge} className={styles.badge} alt="notification badge icon" />
    </div>
);

export default Card;
