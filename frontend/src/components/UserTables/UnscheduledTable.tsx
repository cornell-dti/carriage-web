import React, { useState, useEffect } from 'react';
import { Driver, Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';

type TableProps = {
  drivers: Driver[];
};
const Table = ({ drivers }: TableProps) => {
  const [rides, setRides] = useState<Ride[]>([]);

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const getUnscheduledRides = () => {
    // uncomment to get the rides for only today
    // const today = moment(new Date()).format('YYYY-MM-DD');
    // fetch(`/rides?type=unscheduled&date=${today}`)
    fetch(`/rides?type=unscheduled`)
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  };

  useEffect(getUnscheduledRides, []);

  return (
    <>
      {/* put profile picture here */}
      <img className={styles.profilePic} src="" alt="profile pic" />
      <h1 className={styles.formHeader}>Unscheduled Rides</h1>
      <RidesTable rides={rides} drivers={drivers}
        hasAssignButton={true} />
    </>
  );
};

export default Table;
