import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TableRow from '../TableComponents/TableRow';
import { Ride, Vehicle } from '../../types';
import styles from '../UserTables/table.module.css';
import { useReq } from '../../context/req';

function renderTableHeader(isStudent: boolean) {
    return (
      <tr>
        <th className={styles.tableHeader}>Name + {isStudent ? "/Netid" : ""}</th>
        <th className={styles.tableHeader}>{isStudent ? "Time" : "Date"}</th>
        <th className={styles.tableHeader}>Pickup Location</th>
        <th className={styles.tableHeader}>Dropoff Location</th>
        <th className={styles.tableHeader}>Needs</th>
      </tr>
    );
  }

  type PastRideProps = {
    // profilePic: string;
    firstName: string;
    lastName: string;
    netId: string;
    phone: string;
    // address: string;
    accessibility?: string;
    availability?: string[][];
    vehicle?: Vehicle;
    
  }

const PastRides = (isStudent: boolean, rides: Ride[]) => {

  function renderTableData(allRides: Ride[]) {
    return allRides.map((ride, index) => {
      const testBool = true; 
      const date = new Date(ride.startTime).toLocaleDateString();
      const { rider } = ride;
      const name = `${rider.firstName} ${rider.lastName}`;
      const needs = (rider.accessibilityNeeds || []).join(', ');
      const pickupLocation = ride.startLocation.name;
      const pickupTag = ride.startLocation.tag;
      const dropoffLocation = ride.endLocation.name;
      const dropoffTag = ride.endLocation.tag;

      const valueName = { data: name };
      const valueDate = { data: date };
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
    <div>
    <h1 className={styles.formHeader}>Past Rides</h1>
    <div className={styles.tableContainer}>
      <table cellSpacing="0" className={styles.table}>
        <tbody>
          {renderTableHeader(isStudent)}
          {renderTableData(rides)}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default PastRides;