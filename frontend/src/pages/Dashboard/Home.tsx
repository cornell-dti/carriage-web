import React, { useState, useEffect } from 'react';
import RideModal from '../../components/RideModal/RideModal';
import Table from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import styles from './page.module.css';
import { Driver } from '../../types/index';
import { useReq } from '../../context/req';
import ExportButton from '../../components/ExportButton/ExportButton';

const Home = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { withDefaults } = useReq();

  useEffect(() => {
    const fetchDrivers = async () => {
      const driverData = await fetch('/api/drivers', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      setDrivers(driverData);
    };

    fetchDrivers();
  }, [withDefaults]);

  return (
    <div>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Homepage</h1>
        <div className={styles.margin3}>
          <ExportButton/>
          <RideModal />
        </div>
      </div>
      <Schedule />
      <Table drivers={drivers} />
    </div>
  );
};

export default Home;
