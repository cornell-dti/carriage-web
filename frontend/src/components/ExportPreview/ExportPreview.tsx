import React, { useEffect, useState, useRef } from 'react';
import ScheduledTable from '../UserTables/ScheduledTable';
import moment from 'moment';
import { Driver } from '../../types/index';
import styles from './exportPreview.module.css';
import { useReq } from '../../context/req';
import ExportButton from '../ExportButton/ExportButton';
import { useDate } from '../../context/date';
import { CSVLink } from "react-csv";

const ExportPreview = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [downloadData, setDownloadData] = useState<string>("");
  const { withDefaults } = useReq();
  const { curDate } = useDate();
  const csvLink = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);

  const today = moment(curDate).format('YYYY-MM-DD');

  useEffect(() => {
    fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, [withDefaults]);

  const downloadCSV = () => {
    fetch(`/api/rides/download?date=${today}`, withDefaults())
      .then(res => res.text())
      .then(data => {
        setDownloadData(data);
        if (csvLink.current) {
          csvLink.current.link.click(); 
        }
      })
  }

  return (
    <>
      <p className={styles.date}>{moment(curDate).format('YYYY-MM-DD')}</p>
      <h1 className={styles.header}>Scheduled Rides</h1>
      <div id="exportTable">
        {drivers.map((driver: Driver, index: number) => (
          <ScheduledTable
            key={index}
            driverId={driver.id}
            driverName={driver.firstName + ' ' + driver.lastName}
          />
        ))}
      </div>
      <div className={styles.exportButtonContainer}>
        <ExportButton onClick={downloadCSV}/>
        <CSVLink
         data={downloadData}
         filename={`scheduledRides_${today}.csv`}
         className='hidden'
         ref={csvLink}
         target='_blank'
      />
      </div>
    </>
  );
};

export default ExportPreview;
