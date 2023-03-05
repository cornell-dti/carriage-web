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

const Schedule = () => {
  const componentMounted = useRef(true);
  const now = new Date().toISOString();
  const [rides, setRides] = useState<Ride[]>([]);
  const [currRides, setCurrRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const { id, user } = useContext(AuthContext);
  const { withDefaults } = useReq();
  document.title = 'Schedule - Carriage';
  const refreshRides = useCallback(() => {
    fetch(`/api/rides?rider=${id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => componentMounted.current && setRides([...data]));
  }, [id, withDefaults]);

  useEffect(() => {
    refreshRides();
    setPastRides((prev) =>
      prev.concat(rides.filter((ride) => ride.endTime < now) || [])
    );
    setCurrRides((prev) =>
      prev.concat(rides.filter((ride) => ride.endTime >= now) || [])
    );
    return () => {
      componentMounted.current = false;
    };
  }, [refreshRides, rides]);

  return (
    <main id="main">
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>{user?.firstName ?? ''}'s Schedule</h1>
        <div className={styles.rightSection}>
          <RequestRideModal onSubmit={refreshRides} />
          <Notification />
        </div>
      </div>
      {rides && rides.length > 0 && (
        <>
          <Collapsible title={'Your Upcoming Rides'}>
            <RiderScheduleTable data={currRides} isPast={false} />
          </Collapsible>
          <Collapsible title={'Your Past Rides'}>
            <RiderScheduleTable data={pastRides} isPast={false} />
          </Collapsible>
        </>
      )}
      {rides && !rides.length && <NoRidesView />}
    </main>
  );
};

export default Schedule;
