import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Ride, Status } from '../../types/index';
import { useReq } from '../../context/req';
import { useParams } from 'react-router-dom';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import { useRides } from '../../context/RidesContext';

type ScheduleProps = {
  email: string;
};

const Schedule = ({ email }: ScheduleProps) => {
  const [rides, setRides] = useState<Ride[]>();
  const { id: riderId } = useParams<{ id: string }>();
  const [filteredRides, setFilteredRides] = useState<Ride[]>();
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

  const datetime = new Date();

  document.title = 'Schedule - Carriage';
  const refreshRides = useCallback(() => {
    fetch(`/api/rides?rider=${riderId}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides([...data]));
  }, [id, withDefaults]);

  useEffect(() => {
    refreshRides();
  }, [refreshRides, scheduledRides, unscheduledRides, setRides]);

  console.log(rides);
  const sorted = rides?.sort(compRides);
  console.log('sorted');
  console.log(sorted);
  useEffect(() => {
    const filteredRides = sorted?.filter((r) => {
      const end = new Date(r.endTime);
      return r.rider.email == email && end > datetime;
    });
    setFilteredRides(filteredRides);

    const filteredPastRides = sorted?.filter((r) => {
      const end = new Date(r.endTime);
      return r.rider.email == email && end < datetime;
    });
    setPastRides(filteredPastRides);

    setAbsentRides(
      sorted?.filter((r) => {
        return r.status === Status.NO_SHOW;
      })
    );
  }, [
    refreshRides,
    scheduledRides,
    unscheduledRides,
    rides,
    setAbsentRides,
    setFilteredRides,
    setRides,
  ]);
  console.log('Filtered');
  console.log(filteredRides);
  filteredRides?.forEach((r) =>
    console.log(new Date(r.endTime).toLocaleString())
  );

  return (
    <main id="main">
      {filteredRides && filteredRides.length >= 0 && (
        <Collapsible title={'Your Upcoming Rides'}>
          <RiderScheduleTable
            data={filteredRides}
            isPast={false}
            email={email}
          />
        </Collapsible>
      )}
      {pastRides && pastRides.length >= 0 && (
        <Collapsible title={'Your Past Rides'}>
          <RiderScheduleTable data={pastRides} isPast={false} email={email} />
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
      {rides && !rides.length && <NoRidesView />}
    </main>
  );
};

export default Schedule;
