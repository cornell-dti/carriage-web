import React, { useState, useEffect } from 'react';
import { Ride } from '../../types/index';
import styles from './driverrides.module.css';
import { useRides } from '../../context/RidesContext';
import { Stack, PaginationItem, Pagination } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

type DriverInfo = {
  id: string;
  todayOrPast: boolean;
};

const DriverRides = ({ id, todayOrPast }: DriverInfo) => {
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
    const filteredRides = scheduledRides
      .filter((ride) => ride.driver?.id === id)
      .sort(compRides);
    setRides(filteredRides);
  }, [scheduledRides, id]);

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

  const ongoingRidesToday = rides.filter(
    (ride) => new Date(ride.startTime) > now || new Date(ride.endTime) > now
  );
  const completedRidesToday = rides.filter(
    (ride) => new Date(ride.startTime) < now && new Date(ride.endTime) < now
  );

  const rideOnWeekday = (day: number) =>
    rides.filter((ride) => {
      const rideDay = new Date(ride.endTime).getDay();
      return rideDay === day;
    });

  if (todayOrPast)
    return (
      <div className={styles.rides}>
        <div className={styles.table}>
          <div className={styles.tableColumn}>
            <h3>Upcoming/Current Rides</h3>
            {ongoingRidesToday.length > 0 && (
              <>{ongoingRidesToday.map(renderRide)}</>
            )}
          </div>

          <div className={styles.tableColumn}>
            <h3>Completed Rides</h3>
            {completedRidesToday.length > 0 && (
              <>{completedRidesToday.map(renderRide)}</>
            )}
          </div>
        </div>
      </div>
    );
  else
    return (
      <div>
        <Stack spacing={2}>
          <Pagination
            count={10}
            siblingCount={0}
            boundaryCount={0}
            renderItem={(item) => {
              if (item.type === 'previous' || item.type === 'next') {
                return (
                  <PaginationItem
                    {...item}
                    slots={{
                      previous: ArrowBackIcon,
                      next: ArrowForwardIcon,
                    }}
                    sx={{ mx: 29 }} // mx = horizontal margin
                  />
                );
              }
              return null; // Don't render number buttons
            }}
          />
        </Stack>
        <div className={styles.rides}>
          <div className={styles.table}>
            <div className={styles.tableColumn}>
              <div className={styles.tableRow}>
                <h3>Monday</h3>
                {rideOnWeekday(1).length > 0 && (
                  <div className={styles.cellGroup}>
                    {rideOnWeekday(1).map(renderRide)}
                  </div>
                )}
              </div>

              <div className={styles.tableRow}>
                <h3>Wednesday</h3>
                {rideOnWeekday(3).length > 0 && (
                  <div className={styles.cellGroup}>
                    {rideOnWeekday(3).map(renderRide)}
                  </div>
                )}
              </div>

              <div className={styles.tableRow}>
                <h3>Friday</h3>
                {rideOnWeekday(5).length > 0 && (
                  <div className={styles.cellGroup}>
                    {rideOnWeekday(5).map(renderRide)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.tableColumn}>
              <div className={styles.tableRow}>
                <h3>Tuesday</h3>
                {rideOnWeekday(2).length > 0 && (
                  <div className={styles.cellGroup}>
                    {rideOnWeekday(2).map(renderRide)}
                  </div>
                )}
              </div>

              <div className={styles.tableRow}>
                <h3>Thursday</h3>
                {rideOnWeekday(4).length > 0 && (
                  <div className={styles.cellGroup}>
                    {rideOnWeekday(4).map(renderRide)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default DriverRides;
