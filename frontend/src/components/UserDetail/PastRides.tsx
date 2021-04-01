import React from 'react';
import TableRow from '../TableComponents/TableRow';
import { Ride } from '../../types';
import styles from '../UserTables/table.module.css';

type pastRideProps = {
  isStudent: boolean,
  rides: Ride[]
};

const PastRides = ({ isStudent, rides }: pastRideProps) => {
  function renderTableHeader() {
    return (
      <tr>
        <th className={styles.tableHeader}>{isStudent ? 'Date' : 'Name'}</th>
        <th className={styles.tableHeader}>{isStudent ? 'Time' : 'Date'}</th>
        <th className={styles.tableHeader}>Pickup Location</th>
        <th className={styles.tableHeader}>Dropoff Location</th>
        <th className={styles.tableHeader}>Needs</th>
      </tr>
    );
  }
  function renderTableData() {
    return rides.map((ride, index) => {
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

      return (
        <tr key={index}>
          <TableRow values={inputValues} />
        </tr>
      );
    });
  }
  return (
    <div>
      <h1 className={styles.formHeader}>Past Rides</h1>
      <div className={styles.tableContainer}>
        <table cellSpacing="0" className={styles.table}>
          <tbody>
            {renderTableHeader()}
            {renderTableData()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PastRides;
