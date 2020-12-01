import React, { useState, useEffect } from 'react';
import RideModal from '../../components/RideModal/RideModal';
import Table from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import styles from './home.module.css';
import { Driver } from '../../types/index';

const Home = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const fetchDrivers = async () => {
    const driverData = await fetch('/drivers')
      .then((res) => res.json())
      .then((data) => data.data);
    setDrivers(driverData);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (<>
    <div className={styles.pageTitle}>
      <h1>Homepage</h1>
      <RideModal />
    </div>
    <Schedule />
    <Table drivers={drivers} />
  </>
  );
};

export default Home;
