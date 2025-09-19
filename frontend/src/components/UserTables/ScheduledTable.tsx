import React, { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';

type ScheduledTableProp = {
  query: string; // either 'rider' or 'driver'
};

const ScheduledTable = () => {
  const { drivers } = useEmployees();
  const [rides, setRides] = useState<Ride[]>([]);
  const { scheduledRides } = useRides();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(scheduledRides.filter((ride) => ride && ride.id).sort(compRides));
  }, [scheduledRides]);

  return rides.length ? (
    <>
      {drivers.map(({ id, firstName, lastName }) => {
        const name = `${firstName} ${lastName}`;
        const driverRides = rides.filter((r) => r && r.driver?.id === id);
        return driverRides.length ? (
          <React.Fragment key={id}>
            <h1 className={styles.formHeader}>{name}</h1>
            <RidesTable rides={driverRides} hasButtons={true} />
          </React.Fragment>
        ) : null;
      })}
    </>
  ) : null;
};

export default ScheduledTable;
