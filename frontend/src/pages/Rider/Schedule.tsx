import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Ride, Status } from '../../types/index';
import { useReq } from '../../context/req';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import styles from './page.module.css';
import { useRides } from '../../context/RidesContext';
import moment from 'moment';

type ScheduleProps = {
  email: string;
};

const Schedule = ({ email }: ScheduleProps) => {
  const componentMounted = useRef(true);
  const [rides, setRides] = useState<Ride[]>();
  const [pastRides, setPastRides] = useState<Ride[]>();
  const [absentRides, setAbsentRides] = useState<Ride[]>();
  const [filter, setFilter] = useState(false);
  const { id, user } = useContext(AuthContext);
  const { withDefaults } = useReq();
  const { unscheduledRides, scheduledRides } = useRides();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const datetime = moment().toDate();
  console.log(datetime);

  useEffect(() => {
    const combined = scheduledRides
      .sort(compRides)
      .concat(unscheduledRides.sort(compRides));
    console.log(combined);
    const filteredRides = combined.filter((r) => {
      const date = new Date(r.endTime);
      return r.rider.email === email && date > datetime;
    });
    setRides(filteredRides);

    const filteredPastRides = combined.filter((r) => {
      const date = new Date(r.endTime);
      return r.rider.email === email && date < datetime;
    });
    setPastRides(filteredPastRides);

    setAbsentRides(
      combined.filter((r) => {
        return r.status === Status.NO_SHOW;
      })
    );
  }, [scheduledRides, unscheduledRides]);

  // ****************************
  // This seems to be the way that they live refresh the rides
  // ****************************
  const refreshRides = useCallback(() => {
    fetch(`/api/rides/`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => componentMounted.current && setRides([...data]));
  }, [id, withDefaults]);

  useEffect(() => {
    refreshRides();

    return () => {
      componentMounted.current = false;
    };
  }, [refreshRides]);

  //**************************************************** */
  // Check how to pass name to filter rides this way
  // no_show is absent
  // can filter past rides through getting current datetime and checking if later than endTime
  //**************************************************** */
  return (
    <main id="main">
      {rides && rides.length >= 0 && (
        <Collapsible title={'Your Upcoming Rides'}>
          <RiderScheduleTable data={rides} isPast={false} email={email} />
        </Collapsible>
      )}
      {pastRides && pastRides.length >= 0 && (
        <Collapsible title={'Your Past Rides'}>
          <RiderScheduleTable data={pastRides} isPast={true} email={email} />
        </Collapsible>
      )}

      <label>
        <input
          type="checkbox"
          checked={filter}
          onChange={() => setFilter(!filter)}
          style={{
            marginLeft: '2.5rem',
            marginTop: '.5rem',
            marginBottom: '1rem',
            marginRight: '0.75rem',
          }}
        />
        Show rides when rider was absent
      </label>

      {filter && absentRides && absentRides.length >= 0 && (
        <RiderScheduleTable data={absentRides} isPast={true} email={email} />
      )}
      {/* {rides && !rides.length && <NoRidesView />} */}
    </main>
  );
};

export default Schedule;
