import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';

type ScheduledTableProp = { 
  driverId?: string;
  driverName?: string;
};

const ScheduledTable = ({ driverId, driverName }: ScheduledTableProp) => {
  const { curDate } = useDate();
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
    // fetch(`/api/rides?driver=${driverId}&date=${today}&type=scheduled`, withDefaults())
    fetch(`/api/rides?scheduled=true`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        setRides(data.sort(compRides));
        console.log('fetch scheduled rides!');
        console.log(rides.length);
      });
  }, [withDefaults, curDate, driverId]);

  return (
    <>
      <h1 className={styles.formHeader}>{driverName}</h1>
      <RidesTable rides={rides} drivers={[]} hasAssignButton={false} />
    </>
  );
};

export default ScheduledTable;
