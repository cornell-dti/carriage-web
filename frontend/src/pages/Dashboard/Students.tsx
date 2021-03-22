import React, { useState } from 'react';
// import RidersTable from '../../components/UserTables/RidersTable';
import StudentsTable from '../../components/UserTables/StudentsTable';
import RiderModal from '../../components/Modal/RiderModal';
import styles from './page.module.css';

const Riders = () => (
  <>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Students</h1>
      <RiderModal />
    </div>
    <StudentsTable />
  </>
);

export default Riders;
