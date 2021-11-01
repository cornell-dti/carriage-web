import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';

const Table = () => {
  const { drivers } = useEmployees();
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

  return rides.length ? (
    <RidesTable rides={rides} drivers={drivers} hasButtons={true} />
  ) : null;
};

export default Table;
