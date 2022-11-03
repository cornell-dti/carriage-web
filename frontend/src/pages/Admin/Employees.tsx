import React from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import styles from './page.module.css';
import Notification from '../../components/Notification/Notification';

const Employees = () => (
  <main id="main" tabIndex={-1}>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Employees</h1>
      <div className={styles.rightSection}>
        <EmployeeModal />
        <Notification />
      </div>
    </div>
    <EmployeeCards />
  </main>
);

export default Employees;
