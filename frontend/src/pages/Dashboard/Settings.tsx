import React from 'react';
import Logout from '../../components/Logout/Logout';
import styles from './page.module.css';
import DispatcherTable from '../../components/UserTables/DispatcherTable'

const Settings = () => (
  <>
    <h1 className={styles.header}>Settings</h1>
    <div className={styles.pageContainer}>
      <Logout />
      <DispatcherTable />
    </div>
  </>
);

export default Settings;
