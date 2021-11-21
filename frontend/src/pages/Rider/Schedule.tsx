import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Ride } from '../../types';
import { useReq } from '../../context/req';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import RequestRideModal from '../../components/RequestRideModal/RequestRideModal';
import Notification from '../../components/Notification/Notification';
import styles from './page.module.css';
import { useRides } from '../../../src/context/RidesContext';

const Schedule = () => {
  const componentMounted = useRef(true);
  const [rides, setRides] = useState<Ride[]>();
  const { upcomingRides, pastRides, refreshRides } = useRides();
  const { id, user } = useContext(AuthContext);
  const { withDefaults } = useReq();

  useEffect(() => {
    setRides([...upcomingRides, ...pastRides]);
    return () => {
      componentMounted.current = false;
    };
  }, [upcomingRides, pastRides, refreshRides]);

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Hi {user?.firstName ?? ''}</h1>
        <div className={styles.rightSection}>
          <RequestRideModal onSubmit={refreshRides} />
          <Notification />
        </div>
      </div>
      {rides && rides.length > 0 && (
        <>
          <Collapsible title={'Your Upcoming Rides'}>
            <RiderScheduleTable data={rides} isPast={false} />
          </Collapsible>
          <Collapsible title={'Your Past Rides'}>
            <RiderScheduleTable data={rides} isPast={true} />
          </Collapsible>
        </>
      )}
      {rides && !rides.length && <NoRidesView />}
    </main>
  );
};

export default Schedule;
