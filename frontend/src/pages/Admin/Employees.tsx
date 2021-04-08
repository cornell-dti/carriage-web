import React from 'react';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeCards from '../../components/EmployeeCards/EmployeeCards';
import styles from './page.module.css';

const Employees = () => (
  <>
    <div className={styles.pageTitle}>
      <h1 className={styles.header}>Employees</h1>
      <div className={styles.margin3}>
        <EmployeeModal />
      </div>
    </div>
    <EmployeeCards />
  </>
);

export default Employees;
