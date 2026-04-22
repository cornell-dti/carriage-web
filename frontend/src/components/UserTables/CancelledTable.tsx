import React, { useState, useEffect } from 'react';
import { RideType } from '@carriage-web/shared/types/ride';
import RidesTable from './RidesTable';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';

type CancelledTableProp = {
  query: string; // either 'rider' or 'driver'
};

const CancelledTable = () => {
  const { drivers } = useEmployees();
  const [rides, setRides] = useState<RideType[]>([]);
  const { cancelledRides } = useRides();

  const compRides = (a: RideType, b: RideType) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(cancelledRides.filter((ride) => ride && ride.id).sort(compRides));
  }, [cancelledRides]);

  return rides.length ? (
    <>
      {drivers.map(({ id, firstName, lastName }) => {
        const name = `${firstName} ${lastName}`;
        const driverRides = rides.filter((r) => r && r.driver?.id === id);
        return driverRides.length ? (
          <React.Fragment key={id}>
            <h1 className="mt-7 mb-0 ml-8 text-3xl text-gray-600 font-normal text-left">
              {name}
            </h1>
            <RidesTable rides={driverRides} />
          </React.Fragment>
        ) : null;
      })}
    </>
  ) : (
    <div className="text-center text-3xl font-bold mt-8 mb-8">
      No cancelled rides
    </div>
  );
};

export default CancelledTable;
