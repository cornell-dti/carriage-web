import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';
import { useEmployees } from '../../context/EmployeesContext';

type ScheduledTableProp = {
  query: string; // either 'rider' or 'driver'
};

const ScheduledTable = () => {
  const { curDate } = useDate();
  const { drivers } = useEmployees();
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    const today = moment(curDate).format('YYYY-MM-DD');
    fetch(`/api/rides?date=${today}&scheduled=true`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, curDate]);

  return rides.length
    ? (
      <>
        {drivers.map(({ id, firstName, lastName }) => {
          const name = `${firstName} ${lastName}`;
          const driverRides = rides.filter((r) => r.driver?.id === id);
          return driverRides.length ? (
            <>
              <h1 className={styles.formHeader}>{name}</h1>
              <RidesTable rides={driverRides} drivers={[]} hasButtons={false} />
            </>
          ) : null;
        })}
      </>
    ) : null;
};

export default ScheduledTable;
