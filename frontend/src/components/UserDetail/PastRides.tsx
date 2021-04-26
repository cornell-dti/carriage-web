import React from 'react';
import { Row, Table } from '../TableComponents/TableComponents';
import { Ride } from '../../types';
import styles from '../UserTables/table.module.css';

type pastRideProps = {
  isStudent: boolean,
  rides: Ride[]
};

const PastRides = ({ isStudent, rides }: pastRideProps) => {
  const colSizes = [2, 2, 2, 2, 2];
  const studentHeaders = ['Date', 'Time', 'Pickup Location', 'Dropoff Location', 'Needs'];
  const employeeHeaders = ['Name', 'Date', 'Pickup Location', 'Dropoff Location', 'Needs'];
  const headers = isStudent ? studentHeaders : employeeHeaders;
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

      const valueNameDate = isStudent ? date : name;
      const valueDateTime = isStudent ? `${startTime}${' - '}${endTime}` : date;
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = needs;

      const inputValues = [
        valueNameDate,
        valueDateTime,
        valuePickup,
        valueDropoff,
        valueNeeds,
      ];

      return (
        <Row data={inputValues} colSizes={colSizes} />
      );
    });
  }
  return (
    <div>
      <h1 className={styles.formHeader}>Past Rides</h1>
      <div className={styles.tableContainer}>
        <Table>
          <Row
            header
            colSizes={colSizes}
            data={headers.map((h) => (h))}
          />
          {renderTableData()}
        </Table>
      </div>
    </div>
  );
};

export default PastRides;
