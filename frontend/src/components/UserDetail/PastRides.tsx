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
  const header1 = isStudent ? 'Date' : 'Name';
  const header2 = isStudent ? 'Time' : 'Date';
  const headers = [header1, header2, 'Pickup Location', 'Dropoff Location', 'Needs'];
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
          <Row data={inputValues} colSizes={colSizes} />
        </tr>
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
            data={headers.map((h) => ({ data: h }))}
          />
          {renderTableData()}
        </Table>
      </div>
    </div>
  );
};

export default PastRides;
