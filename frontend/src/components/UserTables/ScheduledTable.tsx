import React, { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import moment from 'moment';
import RidesTable from './RidesTable';
import styles from './table.module.css';

type ScheduledTableProp = {
  driverId: string;
  driverName: string;
}

const ScheduledTable = ({ driverId, driverName }: ScheduledTableProp) => {
  const [rides, setRides] = useState<Ride[]>([]);

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const getScheduledRides = () => {
    const today = moment(new Date()).format('YYYY-MM-DD');
    fetch(`/rides?driver=${driverId}date=${today}`)
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  };

  useEffect(getScheduledRides, []);

  return (
    <>
      <h1 className={styles.formHeader}>{driverName}</h1>
      <RidesTable rides={rides} drivers={[]}
        hasAssignButton={false} />
    </>
  )
}

export default ScheduledTable
