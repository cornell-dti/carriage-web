import React from 'react';
import { Row, Table } from '../TableComponents/TableComponents';
import { Ride } from '../../types';
import styles from '../UserTables/table.module.css';

type pastRideProps = {
  isStudent: boolean,
  rides: Ride[]
};

const PastRides = ({ isStudent, rides }: pastRideProps) => {
  const colSizes = [1, 1, 1, 1, 1];
  const headers = [isStudent ? 'Date' : 'Name', isStudent ? 'Time' : 'Date', 'Pickup Location', 'Dropoff Location', 'Needs'];

  return (
    <>
    <h1 className={styles.formHeader}>Past Rides</h1>
    <Table>
      <Row
        header
        colSizes={colSizes}
        data={headers.map((h) => ({ data: h }))}
      />
      {rides.map((ride) => {
        const date = new Date(ride.startTime).toLocaleDateString();
        const startTime = new Date(ride.startTime)
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          .toLowerCase();
        const endTime = new Date(ride.endTime)
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          .toLowerCase();
        const { rider } = ride;
        const name = `${rider.firstName} ${rider.lastName}`;
        const needs = (rider.accessibilityNeeds || []).join(', ');
        const pickupLocation = ride.startLocation.name;
        const pickupTag = ride.startLocation.tag;
        const dropoffLocation = ride.endLocation.name;
        const dropoffTag = ride.endLocation.tag;

        const valueNameDate = { data: isStudent ? date : name };
        const valueDateTime = { data: isStudent ? `${startTime}${' - '}${endTime}` : date };
        const valuePickup = { data: pickupLocation, tag: pickupTag };
        const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
        const valueNeeds = { data: needs };

        const inputValues = [
          valueNameDate,
          valueDateTime,
          valuePickup,
          valueDropoff,
          valueNeeds,
        ];
        return <Row data={inputValues} colSizes={colSizes} />;
      })}
    </Table>
    </>
  );
};

export default PastRides;
