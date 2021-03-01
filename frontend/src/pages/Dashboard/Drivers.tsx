import React from 'react';
import DriverModal from '../../components/DriverModal/DriverModal';
import DriverCards from '../../components/DriverCards/DriverCards';
import AdminCards from '../../components/AdminCards/AdminCards';
import styles from './page.module.css';

const Drivers = () => (
  <>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Drivers</h1>
      <div className={styles.margin3}>
        <DriverModal />
      </div>
    </div>
    <DriverCards /> 
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Admins</h1>
    </div>
    <AdminCards />
  </>
);

export default Drivers;
