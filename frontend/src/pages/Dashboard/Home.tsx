import React from 'react';
import RideModal from '../../components/RideModal/RideModal';
import Table from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import styles from './home.module.css';

const Home = () => (
  <>
    <div className={styles.pageTitle}>
      <h1>Homepage</h1>
      <RideModal />
    </div>
    <Schedule />
    <Table />
  </>
);

export default Home;
