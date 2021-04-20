import React, { useState } from 'react';
import { Driver, Ride } from '../../types/index';
import AssignDriverModal from '../Modal/AssignDriverModal';
import styles from './table.module.css';
import TableRow from '../TableComponents/TableRow';

type RidesTableProps = {
  rides: Ride[];
  drivers: Driver[];
  hasAssignButton: boolean;
}

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

const RidesTable = (
  { rides, drivers, hasAssignButton }: RidesTableProps,
) => {
  const [openModal, setOpenModal] = useState(-1);
  const [driverSet, setDriverSet] = useState([false]);

  function renderTableData(allRides: Ride[]) {
    return allRides.filter((r) => r.startLocation !== undefined
      && r.endLocation !== undefined).map((ride, index) => {
      const startTime = new Date(ride.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = new Date(ride.endTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const { rider } = ride;
      const name = rider ? `${rider.firstName} ${rider.lastName}` : '';
      const needs = rider ? (rider.accessibilityNeeds || []).join(', ') : '';
      const pickupLocation = ride.startLocation.name;
      const pickupTag = ride.startLocation.tag;
      const dropoffLocation = ride.endLocation.name;
      const dropoffTag = ride.endLocation.tag;

      const timeframe = new Date(ride.startTime).toLocaleString('en-US', {
        hour: 'numeric',
        hour12: true,
      });
      const valueName = { data: name };
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = { data: needs };
      const assignModal = () => (
          <AssignDriverModal
            isOpen={(openModal === index) && driverSet[index] !== true}
            close={() => setOpenModal(-1)}
            setDriver={() => {driverSet[index] = true; setDriverSet(driverSet)}}
            ride={rides[0]}
            allDrivers={drivers}
          />
      );

      const assignButton = {
        data: 'Assign',
        buttonHandler: () => setOpenModal(index),
        ButtonModal: assignModal,
      };

      const inputValues = [
        valueName,
        valuePickup,
        valueDropoff,
        valueNeeds,
      ];
      const inputValuesAndButton = [
        valueName,
        valuePickup,
        valueDropoff,
        valueNeeds,
        assignButton,
      ];
      return (
          <tr key={index}>
            <td className={styles.cell}>{timeframe}</td>
            <td className={styles.cell}>
              <span className={styles.bold}>{startTime}</span> <br></br>
              <span className={styles.gray}>-- {endTime}</span>
            </td>
            {(hasAssignButton && driverSet[index] !== true) 
              ? <TableRow values={inputValuesAndButton} />
              : <TableRow values={inputValues} />}
          </tr>
      );
    });
  }

  return (
    <>
      {(rides.length) > 0
        && <div>
          <table cellSpacing="0" className={styles.table}>
            <tbody>
              {renderTableHeader()}
              {renderTableData(rides)}
            </tbody>
          </table>
        </div>}
    </>

  );
};

export default RidesTable;
