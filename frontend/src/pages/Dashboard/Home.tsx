import React from 'react';
import RideModal from '../../components/RideModal/RideModal';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import styles from './page.module.css';
import {useDrivers, DriversProvider} from '../../context/DriversContext';
import ExportButton from '../../components/ExportButton/ExportButton';

const Drivers = () => { 
  const {
    drivers,
  } = useDrivers();

  return (
    <UnscheduledTable drivers={drivers} />
  );
  };
const Home = () => {
  return (
    <div>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Homepage</h1>
        <div className={styles.margin3}>
          <ExportButton />
          <RideModal />
        </div>
      </div>
      <MiniCal />
      <Schedule />
      <DriversProvider>
        <Drivers/>
      </DriversProvider>
    </div>
  );
};

export default Home;
