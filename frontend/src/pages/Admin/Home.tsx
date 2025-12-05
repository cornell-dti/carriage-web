import { useEffect } from 'react';
import AddRideButton from '../../components/AddRideButton/AddRideButton';
import ScheduledTable from '../../components/UserTables/ScheduledTable';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import styles from './page.module.css';
import Collapsible from '../../components/Collapsible/Collapsible';
import { CSVFromRidesButton } from 'components/CSVFromRidesButton/CSVFromRidesButton';

const Home = () => {
  useEffect(() => {
    document.title = 'Home - Carriage';
  }, []);

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Ride Schedule</h1>
        <MiniCal />
        <div className={styles.rightSection}>
          <CSVFromRidesButton></CSVFromRidesButton>
          <AddRideButton />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className={styles.scheduleContainer}>
          <Schedule />
        </div>

        <Collapsible title={'Unscheduled Rides'}>
          <UnscheduledTable />
        </Collapsible>
        <Collapsible title={'Scheduled Rides'}>
          <ScheduledTable />
        </Collapsible>
      </div>
    </main>
  );
};

export default Home;
