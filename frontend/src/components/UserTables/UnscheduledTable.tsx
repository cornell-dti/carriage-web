import React, { useState, useEffect } from 'react';
import { Driver, RealRide } from '../../types/index';
import styles from './table.module.css';
import TableRow from '../TableComponents/TableRow';
import AssignDriverModal from '../Modal/AssignDriverModal';

function renderTableHeader() {
  return (
    <tr>
      <th></th>
      <th className={styles.tableHeader}>Time</th>
      <th className={styles.tableHeader}>Passenger</th>
      <th className={styles.tableHeader}>Pickup Location</th>
      <th className={styles.tableHeader}>Dropoff Location</th>
      <th className={styles.tableHeader}>Needs</th>
    </tr>
  );
}

type TableProps = {
  drivers: Driver[]
}
const Table = ({ drivers }: TableProps) => {
  const [openModal, setOpenModal] = useState(-1);
  const [rides, setRides] = useState<RealRide[]>([]);

  const compRides = (a: RealRide, b: RealRide) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  const getUnscheduledRides = () => {
    fetch('/rides?type=unscheduled').then((res) => res.json()).then(({ data }) => setRides(data.sort(compRides)));
  };

  useEffect(getUnscheduledRides, []);

  function renderTableData(allRides: RealRide[]) {
    return allRides.map((ride, index) => {
      const startTime = (new Date(ride.startTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = (new Date(ride.endTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const { rider } = ride;
      const name = (rider) ? `${rider.firstName} ${rider.lastName}` : '';
      const needs = (rider) ? (rider.accessibilityNeeds || []).join(', ') : '';
      const pickupLocation = ride.startLocation.name;
      const pickupTag = ride.startLocation.tag;
      console.log(pickupTag);
      const dropoffLocation = ride.endLocation.name;
      const dropoffTag = ride.endLocation.tag;


      const timeframe = (new Date(ride.startTime)).toLocaleString('en-US', { hour: 'numeric', hour12: true });
      const valueName = { data: name };
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = { data: needs };
      const assignModal = () => <AssignDriverModal
        isOpen={openModal === index}
        close={() => setOpenModal(-1)}
        ride={rides[0]}
        allDrivers={drivers} />;


      const assignButton = {
        data: 'Assign',
        buttonHandler: () => setOpenModal(index),
        ButtonModal: assignModal,
      };
      const inputValues = [valueName, valuePickup, valueDropoff, valueNeeds, assignButton];
      return (
        <tr key={index}>
          <td className={styles.cell}>{timeframe}</td>
          <td className={styles.cell}>
            <span className={styles.bold}>{startTime}</span> <br></br>
            <span className={styles.gray}>-- {endTime}</span></td>
          <TableRow values={inputValues} />
        </tr >
      );
    });
  }

  return (
    <>
      <div>
        <h1 className={styles.formHeader}>Unscheduled Rides</h1>
        <table cellSpacing='0' className={styles.table} >
          <tbody>
            {renderTableHeader()}
            {renderTableData(rides)}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
