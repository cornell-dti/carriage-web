import React from 'react';
import StudentsTable from '../../components/UserTables/StudentsTable';
import RiderModal from '../../components/Modal/RiderModal';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';

const Riders = () => (
  <main id = "main">
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Students</h1>
      <div className={styles.rightSection}>
        <RiderModal />
        <Notification />
      </div>
    </div>
    <StudentsTable />
  </main>
);

export default Riders;
