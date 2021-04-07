import React from 'react';
import Table from '../../components/AnalyticsTable/AnalyticsTable';
import styles from './page.module.css';

const Settings = () => (
  <>
    <h1 className={styles.header}>Settings</h1>
    <div className={styles.pageContainer}>
      <Table type="ride" />
      <Table type="driver" />
    </div>
  </>
);

export default Settings;
