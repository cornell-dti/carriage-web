import { useEffect } from 'react';
import AddRideButton from '../../components/AddRideButton/AddRideButton';
import ScheduledTable from '../../components/UserTables/ScheduledTable';
import UnscheduledTable from '../../components/UserTables/UnscheduledTable';
import Schedule from '../../components/Schedule/Schedule';
import MiniCal from '../../components/MiniCal/MiniCal';
import Notification from '../../components/Notification/Notification';
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
        <MiniCal />
        <div className={styles.rightSection}>
          <CSVFromRidesButton></CSVFromRidesButton>
          <AddRideButton />
          <Notification />
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
    </main>
  );
};

export default Home;
