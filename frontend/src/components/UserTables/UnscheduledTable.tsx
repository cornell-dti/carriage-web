import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Driver, Ride } from '../../types/index';
import RidesTable from './RidesTable';

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
<<<<<<< HEAD
    <RidesTable title="Unscheduled Rides" rides={rides} drivers={drivers}
      hasAssignButton={true} />
=======
    <>
      <div>
        <h1 className={styles.formHeader}>Unscheduled Rides</h1>
        <div className={styles.tableContainer}>
          <table cellSpacing='0' className={styles.table} >
            <tbody>
              {renderTableHeader()}
              {renderTableData(rides)}
            </tbody>
          </table>
        </div>
      </div>
    </>
>>>>>>> e1dd8bd20211ec44e111271621572edf1434201a
  );
};

export default Table;
