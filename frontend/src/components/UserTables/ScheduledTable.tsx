import React, { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import { useRiders } from '../../context/RidersContext';

type ScheduledTableProp = {
  riderId?: string;
};

const ScheduledTable = ({ riderId }: ScheduledTableProp) => {
  const { drivers } = useEmployees();
  const { riders } = useRiders();
  const [rides, setRides] = useState<Ride[]>([]);
  const { scheduledRides } = useRides();
  const filteredRides = rides.filter((ride) => ride.rider?.id === riderId); // the rides for the user with the specific riderId

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(scheduledRides.sort(compRides));
  }, [scheduledRides]);

  return rides.length ? (
    <>
      {riderId ? (
        <RidesTable rides={filteredRides} hasButtons={false} />
      ) : (
        drivers.map(({ id, firstName, lastName }) => {
          const name = `${firstName} ${lastName}`;
          const driverRides = rides.filter((r) => r.driver?.id === id);
          return driverRides.length ? (
            <React.Fragment key={id}>
              <h1 className={styles.formHeader}>{name}</h1>
              <RidesTable rides={driverRides} hasButtons={false} />
            </React.Fragment>
          ) : null;
        })
      )}
    </>
  ) : null;
};

export default ScheduledTable;
