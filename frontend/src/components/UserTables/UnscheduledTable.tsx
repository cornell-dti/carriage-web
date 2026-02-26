import { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import { useRides } from '../../context/RidesContext';
import styles from './table.module.css';

const Table = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const { unscheduledRides } = useRides();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(unscheduledRides.sort(compRides));
  }, [unscheduledRides]);

  return rides.length ? <RidesTable rides={rides} /> : (
    <div className={styles.noRides}>No unscheduled rides</div>
  );
};

export default Table;
