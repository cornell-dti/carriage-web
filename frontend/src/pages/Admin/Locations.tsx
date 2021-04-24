import React from 'react';
import LocationsTable from '../../components/UserTables/LocationsTable';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';
import LocationModal from '../../components/LocationModal/LocationModal';

const Locations = () => (
  <div>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Locations</h1>
      <div className={styles.rightSection}>
        <LocationModal />
        <Notification />
      </div>
    </div>
    <LocationsTable />
  </div>
);

export default Locations;
