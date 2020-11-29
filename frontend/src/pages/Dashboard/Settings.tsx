import React from 'react';
import Logout from '../../components/Logout/Logout';
import styles from './page.module.css';
import Table from '../../components/UserTables/DispatcherTable'

const Settings = () => (
  <>
    <h1 className={styles.header}>Settings</h1>
    <div className={styles.pageContainer}>
      <Logout />
      <Table />
    </div>
  </>
);

export default Settings;
