import React from 'react';
import ScheduledTable from '../UserTables/ScheduledTable';
import moment from 'moment';
import { Driver } from '../../types/index';
import styles from './exportPreview.module.css';
import { useDate } from '../../context/date';
import {useDrivers, DriversProvider} from '../../context/DriversContext';

const Drivers = () => { 
  const {
    drivers,
  } = useDrivers();
  return(
    <div id="exportTable">
    {drivers.map((driver: Driver, index: number) => (
      <ScheduledTable
        key={index}
        driverId={driver.id}
        driverName={driver.firstName + ' ' + driver.lastName}
      />
    ))}
  </div>
  );
};

const ExportPreview = () => {
  const { curDate } = useDate();
  return (
    <>
      <p className={styles.date}>{moment(curDate).format('YYYY-MM-DD')}</p>
      <h1 className={styles.header}>Scheduled Rides</h1>
      <DriversProvider>
        <Drivers/>
      </DriversProvider>
    </>
  );
};

export default ExportPreview;
