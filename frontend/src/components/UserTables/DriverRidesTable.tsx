import React, { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import RidesTable from './RidesTable';
import styles from './driverrides.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import { id } from 'date-fns/locale';

const DriverRides = () => {
  const { drivers } = useEmployees();
  const [rides, setRides] = useState<Ride[]>([]);
  const { scheduledRides } = useRides();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    setRides(scheduledRides.sort(compRides));
  }, [scheduledRides]);

  const renderRide = (ride: Ride) => {
    const startTime = new Date(ride.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(ride.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const { rider } = ride;
    const riderName = rider
      ? `${rider.firstName} ${rider.lastName} | ${rider.email.split('@')[0]}`
      : '';

    const pickupLocation = ride.startLocation.name;
    const dropoffLocation = ride.endLocation.name;

    const status = ride.status;

    const timeframe = new Date(ride.startTime).toLocaleString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
    const valuePickup = { data: pickupLocation };
    const valueDropoff = { data: dropoffLocation };

    const startEndTimeLocation = {
      data: (
        <span>
          <p className={styles.bold}>
            {startTime}-- {endTime}
          </p>
          <p className={styles.bold}>
            {valuePickup.data} {'->'} {valueDropoff.data}
          </p>
        </span>
      ),
    };

    return (
      <div className={styles.cell}>
        <div className={styles.tableHeader} style={{ flex: 1 }}>
          {startEndTimeLocation.data}
          <br></br>

          <div className={styles.nameAndStatus}>
            <span>{riderName}</span>
            <div className={styles.statusTag}>{status}</div>
          </div>
        </div>
      </div>
    );
  };

  const now = new Date();
  const ongoingRides = rides.filter((ride) => new Date(ride.startTime) >= now);
  const completedRides = rides.filter((ride) => new Date(ride.startTime) < now);

  return (
    <div className={styles.table}>
      <div className={styles.tableRow}>
        <h3>Upcoming/Current Rides</h3>
        {ongoingRides.length > 0 && <>{ongoingRides.map(renderRide)}</>}
      </div>

      <div className={styles.tableRow}>
        <h3>Completed Rides</h3>
        {completedRides.length > 0 && <>{completedRides.map(renderRide)}</>}
      </div>
    </div>
  );
};

export default DriverRides;
