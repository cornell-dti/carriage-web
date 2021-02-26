import React, { useState, useEffect } from 'react';
import { Driver, Ride } from '../../types/index';
import RidesTable from './RidesTable';
import moment from 'moment';
import styles from './table.module.css';
import { useReq } from '../../context/req';

type TableProps = {
  drivers: Driver[];
};
const Table = ({ drivers }: TableProps) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const getUnscheduledRides = () => {
    const today = new Date();
    const tmr = today.setDate(today.getDate() + 1);
    const tmrFormatted = moment(tmr).format('YYYY-MM-DD');
    fetch(`/api/rides?type=unscheduled&date=${tmrFormatted}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  };

  useEffect(getUnscheduledRides, []);

  return (
    <>
      <img className={styles.profilePic} src="" alt="profile pic" />
      <h1 className={styles.formHeader}>Unscheduled Rides</h1>
      <RidesTable rides={rides} drivers={drivers}
        hasAssignButton={true} />
    </>
  );
};

export default Table;
