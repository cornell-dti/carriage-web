import React, { useContext } from 'react';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';
import AuthContext from '../../context/auth';

const RiderHome = () => {
  const { id } = useContext(AuthContext);

  return (
    <div>
      <Collapsible title={'Your Upcoming Rides'}>
        <RiderScheduleTable riderId={id} isPast={false} />
      </Collapsible>
      <Collapsible title={'Your Past Rides'}>
        <RiderScheduleTable riderId={id} isPast={true} />
      </Collapsible>
    </div >
  );
};

export default RiderHome;
