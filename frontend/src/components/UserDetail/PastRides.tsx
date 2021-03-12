import React from 'react';
import TableRow from '../TableComponents/TableRow';
import { Ride } from '../../types';
import styles from '../UserTables/table.module.css';

  type pastRideProps = {
    isStudent: boolean, 
    rides: Ride[],
    netid: string
  };

const PastRides = ({isStudent, rides, netid}: pastRideProps) => {
  function renderTableHeader() {
    return (
      <tr>
        <th className={styles.tableHeader}>Name {isStudent ? "/Netid" : ""}</th>
        <th className={styles.tableHeader}>{isStudent ? "Time" : "Date"}</th>
        <th className={styles.tableHeader}>Pickup Location</th>
        <th className={styles.tableHeader}>Dropoff Location</th>
        <th className={styles.tableHeader}>Needs</th>
      </tr>
    );
  }
  function renderTableData() {
    console.log(rides);
    return rides.map((ride, index) => {
      const testBool = true; 
      const date = new Date(ride.startTime).toLocaleDateString();
      const startTime = new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(ride.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const { rider } = ride;
      const name = `${rider.firstName} ${rider.lastName} ${netid.length > 0 ?  "/" + netid : netid}`;
      const needs = (rider.accessibilityNeeds || []).join(', ');
      const pickupLocation = ride.startLocation.name;
      const pickupTag = ride.startLocation.tag;
      const dropoffLocation = ride.endLocation.name;
      const dropoffTag = ride.endLocation.tag;

      const valueName = { data: name };
      const valueDate = { data: isStudent  ? `${startTime}${" : "}${endTime}` : date };
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = { data: needs };

      const inputValues = [
        valueName,
        valueDate,
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