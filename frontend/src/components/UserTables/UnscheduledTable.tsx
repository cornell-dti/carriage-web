import React, { useState } from 'react';
import { Passenger, Driver } from '../../types/index';
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
  const passengers = [
    { startTime: '8:20am', endTime: '8:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '8:30am', endTime: '8:50am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '9:10am', endTime: '9:40am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '9:30am', endTime: '9:50am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
    { startTime: '10:10am', endTime: '10:30am', name: 'Rose Lisborn', pickupLocation: 'Eddygate', pickupTag: 'Ctown', dropoffLocation: 'Hollister Hall', dropoffTag: 'West', needs: 'Crutches' },
  ];

  function renderTableData(allPassengers: Passenger[]) {
    let currentTime = '';

    return allPassengers.map((rider, index) => {
      const { startTime, endTime, name, pickupLocation, pickupTag,
        dropoffLocation, dropoffTag, needs } = rider;
      const colon = startTime.indexOf(':');
      const timeOfDay = startTime.substring(startTime.indexOf('m') - 1).toUpperCase();
      const startHour = startTime.substring(0, colon) + timeOfDay;
      if (startHour !== currentTime) {
        currentTime = startHour;
      } else {
        currentTime = '';
      }

      const timeframe = currentTime;
      const valueName = { data: name };
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = { data: needs };
      const assignModal = () => <AssignDriverModal
        isOpen={openModal === index}
        close={() => setOpenModal(-1)}
        ride={passengers[0]}
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
            {renderTableData(passengers)}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
