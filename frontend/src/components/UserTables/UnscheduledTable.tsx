import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Driver, Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';

type TableProps = {
  drivers: Driver[];
};

const Table = ({ drivers }: TableProps) => {
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
    fetch(`/api/rides?type=unscheduled&date=${today}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, curDate]);

  return (
    <>
<<<<<<< HEAD
      <h1 className={styles.formHeader}>Unscheduled Rides</h1>
      <RidesTable rides={rides} drivers={drivers} hasButtons={true} />
=======
      <RidesTable rides={rides} drivers={drivers} hasAssignButton={true} />
>>>>>>> ac5b3ddb0a829f91dc2c09b058f9e6241d92ab83
    </>
  );
};

export default Table;
