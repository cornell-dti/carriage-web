import React from 'react';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';

const Analytics = () => (
  <div>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Analytics</h1>
      <div className={styles.rightSection}>
        <Notification />
      </div>
    </div>
    <div className={styles.pageContainer}>
    </div>
  </div>
);

export default Analytics;
