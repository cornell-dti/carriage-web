import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Driver, Ride } from '../../types/index';
import RidesTable from './RidesTable';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';
import styles from './table.module.css';

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

  return <RidesTable rides={rides} drivers={drivers} hasButtons={true} />;
};

export default Table;
