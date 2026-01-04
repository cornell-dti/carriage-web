import { useEffect } from 'react';
import AddRideButton from '../../components/AddRideButton/AddRideButton';
import ScheduledTable from '../../components/UserTables/ScheduledTable';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import CancelledTable from '../../components/UserTables/CancelledTable';
import Schedule from '../../components/Schedule/Schedule';
import styles from './page.module.css';
import Collapsible from '../../components/Collapsible/Collapsible';
import { CSVFromRidesButton } from 'components/CSVFromRidesButton/CSVFromRidesButton';
import { DayNavigation } from 'components/DayNavigation/DayNavigation';

const Home = () => {
  useEffect(() => {
    document.title = 'Home - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1 className={styles.header}>Ride Schedule</h1>
          <DayNavigation></DayNavigation>
          <div className={styles.rightSection}>
            <CSVFromRidesButton></CSVFromRidesButton>
            <AddRideButton />
          </div>
        </div>

        <div className={styles.scheduleContainer}>
          <Schedule />
        </div>

      <Collapsible title={'Unscheduled Rides'}>
        <UnscheduledTable />
      </Collapsible>
      <Collapsible title={'Scheduled Rides'}>
        <ScheduledTable />
      </Collapsible>
      <Collapsible title={'Cancelled Rides'}>
        <CancelledTable />
      </Collapsible>
    </main>
  );
};

export default Home;
