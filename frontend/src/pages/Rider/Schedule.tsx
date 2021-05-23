import React, { useContext, useState, useEffect } from 'react';
import { useReq } from '../../context/req';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';
import AuthContext from '../../context/auth';
import NoRidesView from '../../components/NoRidesView/NoRidesView';
import { Ride } from '../../types/index';

const Schedule = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const { id } = useContext(AuthContext);
  const { withDefaults } = useReq();

  useEffect(() => {
    fetch(`/api/rides?rider=${id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main id="main">
      {(rides && rides.length) && (
        <>
          <Collapsible title={'Your Upcoming Rides'}>
            <RiderScheduleTable data={rides} isPast={false} />
          </Collapsible>
          <Collapsible title={'Your Past Rides'}>
            <RiderScheduleTable data={rides} isPast={true} />
          </Collapsible>
        </>
      )}
      {(rides && !rides.length) && <NoRidesView />}
    </main>
  );
};

export default Schedule;
