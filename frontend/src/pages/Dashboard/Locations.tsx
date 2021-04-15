import React from 'react';
import Table from '../../components/UserTables/LocationsTable';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';

const Locations = () => (
  <main id = "main">
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Locations</h1>
      <div className={styles.rightSection}>
        <Notification />
      </div>
    </div>
    <Table />
  </main>
);

export default Locations;
