import React, { useState, useEffect } from 'react';
import { RideType } from '@carriage-web/shared/src/types/ride';
import RidesTable from './RidesTable';
import { useRides } from '../../context/RidesContext';

const Table = () => {
  const [rides, setRides] = useState<RideType[]>([]);
  const { unscheduledRides } = useRides();

  const compRides = (a: RideType, b: RideType) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(unscheduledRides.sort(compRides));
  }, [unscheduledRides]);

  return rides.length ? <RidesTable rides={rides} hasButtons={true} /> : null;
};

export default Table;
