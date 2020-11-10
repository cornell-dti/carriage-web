import React from 'react';
import Logout from '../../components/Logout/Logout';
import styles from './page.module.css';

const Settings = () => (
  <>
    <h1 className={styles.header}>Settings</h1>
    <div className={styles.pageContainer}>
      <Logout />
    </div>
  </>
);

export default Settings;
