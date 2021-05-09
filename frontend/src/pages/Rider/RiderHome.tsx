import React from 'react';
import RiderScheduleTable from '../../components/UserTables/RiderScheduleTable';
import Collapsible from '../../components/Collapsible/Collapsible';

const RiderHome = () => {
  const riderId = 'e4586b99-5dce-47ac-b27d-0fbb3f8b4389';

  return (
    <div>
      <Collapsible title={'Your Upcoming Rides'}>
        <RiderScheduleTable riderId={riderId} isPast={false}/>
      </Collapsible>

      <Collapsible title={'Your Past Rides'}>
        <RiderScheduleTable riderId={riderId} isPast={true}/>
      </Collapsible>
    </div >
  );
};

export default RiderHome;
