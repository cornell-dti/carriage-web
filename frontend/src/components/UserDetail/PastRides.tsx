import React from 'react';
import { Row, Table } from '../TableComponents/TableComponents';
import { Ride } from '../../types';
import styles from './userDetail.module.css';

type PastRideProps = {
  isStudent: boolean;
  rides: Ride[];
};

const PastRides = ({ isStudent, rides }: PastRideProps) => {
  const colSizes = [1, 1, 1, 1, 1];
  const headers = [
    isStudent ? 'Date' : 'Name',
    isStudent ? 'Time' : 'Date',
    'Pickup Location',
    'Dropoff Location',
    'Needs',
  ];

  return (
    <div className={styles.pastRidesContainer}>
      <h3 className={styles.userDetailHeader}>Past Rides</h3>
      {rides.length !== 0 ? (
        <Table>
          <Row
            header
            colSizes={colSizes}
            data={headers.map((h) => ({ data: h }))}
          />
          {rides.map((ride, index) => {
            const date = new Date(ride.startTime).toLocaleDateString();
            const startTime = new Date(ride.startTime)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              .toLowerCase();
            const endTime = new Date(ride.endTime)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              .toLowerCase();
            const { rider } = ride;
            const name = `${rider.firstName} ${rider.lastName}`;

            // Convert accessibility array to string
            const needs =
              rider.accessibility && rider.accessibility.length > 0
                ? rider.accessibility.join(', ')
                : 'None';

            const pickupLocation = ride.startLocation.name;
            const pickupTag = ride.startLocation.tag;
            const dropoffLocation = ride.endLocation.name;
            const dropoffTag = ride.endLocation.tag;

            const valueNameDate = isStudent ? date : name;
            const valueDateTime = isStudent
              ? `${startTime} - ${endTime}`
              : date;
            const valuePickup = { data: pickupLocation, tag: pickupTag };
            const valueDropoff = { data: dropoffLocation, tag: dropoffTag };

            const inputValues = [
              valueNameDate,
              valueDateTime,
              valuePickup,
              valueDropoff,
              needs, // Now needs is a string
            ];

            return <Row data={inputValues} colSizes={colSizes} key={index} />;
          })}
        </Table>
      ) : (
        <p className={styles.noContentText}>No rides completed.</p>
      )}
    </div>
  );
};

export default PastRides;
