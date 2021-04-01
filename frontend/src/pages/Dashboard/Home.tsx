import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import RideModal from '../../components/RideModal/RideModal';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import styles from './page.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import ExportButton from '../../components/ExportButton/ExportButton';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';

const Home = () => {
  const {drivers} = useEmployees();
  const { withDefaults } = useReq();

  const [downloadData, setDownloadData] = useState<string>('');
  const csvLink = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const { curDate } = useDate();
  const today = moment(curDate).format('YYYY-MM-DD');

  const downloadCSV = () => {
    fetch(`/api/rides/download?date=${today}`, withDefaults())
      .then((res) => res.text())
      .then((data) => {
        if (data==='') {
          setDownloadData('Name,Pick Up,From,To,Drop Off,Needs,Driver');
        } else {
          setDownloadData(data);
        }
        if (csvLink.current) {
          csvLink.current.link.click();
        }
      });
  };

  return (
    <div>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Homepage</h1>
        <div className={styles.margin3}>
          <ExportButton onClick={downloadCSV} />
          <CSVLink
            data={downloadData}
            filename={`scheduledRides_${today}.csv`}
            className='hidden'
            ref={csvLink}
            target='_blank'
          />
          <RideModal />
        </div>
      </div>
      <MiniCal />
      <Schedule />
      <UnscheduledTable drivers={drivers} />
    </div>
  );
};

export default Home;
