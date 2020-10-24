import React from 'react';
import RideModal from '../../components/RideModal/RideModal';
import Table from '../../components/UserTables/UnscheduledTable';
import styles from './home.module.css';

const Home = () => (
  <>
    <div className={styles.pageTitle}>
      <h1>Homepage</h1>
      <RideModal />
    </div>
    <Table />
  </>
);

export default Home;
