import React from 'react';
import DriverModal from '../../components/DriverModal/DriverModal';
import DriverCards from '../../components/DriverCards/DriverCards';
import styles from './page.module.css';

const Drivers = () => (
  <>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Employees</h1>
      <div className={styles.margin3}>
        <DriverModal />
      </div>
    </div>
    <DriverCards />
  </>
);

export default Drivers;
