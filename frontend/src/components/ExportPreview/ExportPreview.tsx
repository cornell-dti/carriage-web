import React, { useEffect, useState } from 'react';
import ScheduledTable from '../UserTables/ScheduledTable';
import moment from 'moment';
import { Driver } from '../../types/index';
import styles from './exportPreview.module.css';
import { useReq } from '../../context/req';
import ExportButton from '../ExportButton/ExportButton';

const ExportPreview = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { withDefaults } = useReq();

  useEffect(() => {
    fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, []);

  const downloadCSV = () => {

  }

  return (
    <>
      <p className={styles.date}>{moment(new Date()).format('YYYY-MM-DD')}</p>
      <h1 className={styles.header}>Scheduled Rides</h1>
      <div id="exportTable">
        {drivers.map(
          (driver: Driver, index: number) =>
            <ScheduledTable key={index} driverId={driver.id}
              driverName={driver.firstName + " " + driver.lastName} />
        )}
      </div>
      <div className={styles.exportButtonContainer}>
        <ExportButton onClick={downloadCSV}/>
      </div>
    </>
  )
}

export default ExportPreview
