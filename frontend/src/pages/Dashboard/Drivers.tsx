import React from 'react';
import DriverCards from '../../components/DriverCards/DriverCards';
import styles from './page.module.css';

const Drivers = () => (
  <>
    <h1 className={styles.header}>Drivers</h1>
    <DriverCards />
  </>
);

export default Drivers;
