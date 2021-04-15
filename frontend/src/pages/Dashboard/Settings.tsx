import React from 'react';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import Logout from '../../components/Logout/Logout';
// import DispatcherTable from '../../components/UserTables/DispatcherTable';

const Settings = () => (
  <main id = "main">
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Settings</h1>
      <div className={styles.rightSection}>
        <Logout />
        <Notification />
      </div>
    </div>
    <div className={styles.pageContainer}>
      {/* <DispatcherTable /> */}
    </div>
  </main>
);

export default Settings;
