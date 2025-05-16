import React, { useEffect } from 'react';
import RideModal from '../../components/RideModal/RideModal';
import ScheduledTable from '../../components/UserTables/ScheduledTable';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';
import ExportButton from '../../components/ExportButton/ExportButton';
import { useDate } from '../../context/date';
import Collapsible from '../../components/Collapsible/Collapsible';
import { format_date } from '../../util/index';

const Home = () => {
  const { curDate } = useDate();
  const today = format_date(curDate);

  useEffect(() => {
    document.title = 'Home - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <MiniCal />
        <div className={styles.rightSection}>
          <ExportButton
            toastMsg={`${today} data has been downloaded.`}
            endpoint={`/api/rides/download?date=${today}`}
            csvCols={'Name,Pick Up,From,To,Drop Off,Needs,Driver'}
            filename={`scheduledRides_${today}.csv`}
          />
          <RideModal />
          <Notification />
        </div>
      </div>

      <Schedule />

      <Collapsible title={'Unscheduled Rides'}>
        <UnscheduledTable />
      </Collapsible>
      <Collapsible title={'Scheduled Rides'}>
        <ScheduledTable />
      </Collapsible>
    </main>
  );
};

export default Home;
