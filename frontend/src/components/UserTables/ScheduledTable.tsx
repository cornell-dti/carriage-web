import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './table.module.css';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';

type ScheduledTableProp = {
  query: string; // either 'rider' or 'driver'
  id: string;
  name: string;
};

const ScheduledTable = ({ query, id, name }: ScheduledTableProp) => {
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
    fetch(`/api/rides?${query}=${id}&date=${today}&scheduled=true`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        setRides(data.sort(compRides));
      });
  }, [withDefaults, curDate, id, query]);

  return (
    <>
      {rides.length > 0
        && <>
          <h1 className={styles.formHeader}>{name}</h1>
          <RidesTable rides={rides} drivers={[]} hasAssignButton={false} />
        </>}
    </>
  );
};

export default ScheduledTable;
