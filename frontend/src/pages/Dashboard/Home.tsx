import React, { useState, useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import RideModal from '../../components/RideModal/RideModal';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import { Button } from '../../components/FormElements/FormElements';
import styles from './page.module.css';
import { Driver } from '../../types/index';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';
import ExportButton from '../../components/ExportButton/ExportButton';

const Home = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { withDefaults } = useReq();

  // states for the rides model
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const [downloadData, setDownloadData] = useState<string>('');
  const csvLink = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const { curDate } = useDate();
  const today = moment(curDate).format('YYYY-MM-DD');

  useEffect(() => {
    const fetchDrivers = async () => {
      const driverData = await fetch('/api/drivers', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
      setDrivers(driverData);
    };

    fetchDrivers();
  }, [withDefaults]);

  const openRidesModal = () => {
    setCurrentPage(0);
    setIsOpen(true);
  };

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
          <Button onClick={openRidesModal}>+ Add ride</Button> 
          <RideModal 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>
      <MiniCal />
      <Schedule />
      <UnscheduledTable drivers={drivers} />
    </div>
  );
};

export default Home;
