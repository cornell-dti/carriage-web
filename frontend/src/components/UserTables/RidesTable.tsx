import React, { useState } from 'react';
import { Driver, Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import AssignDriverModal from '../Modal/AssignDriverModal';
import styles from './table.module.css';

type RidesTableProps = {
  rides: Ride[];
  drivers: Driver[];
  hasAssignButton: boolean;
}

const RidesTable = ({ rides, drivers, hasAssignButton }: RidesTableProps) => {
  const [openModal, setOpenModal] = useState(-1);

  //0.65fr 1fr .65fr 0.65fr 0.65fr .5fr
  const unscheduledDataColSizes = [1, 1, 1, 1, 1];
  const unscheduledHeaderColSizes = [1, 1, 1, 1, 1];//[1, 0.8, 1, 1, 1, 1];
  const unscheduledHeaders = ['Time', 'Passenger', 'Pickup Location', 'Dropoff Location', 'Needs'];
 
  const scheduledColSizes = [1, 1, 1, 1, 1, 1];
  const scheduledHeaders = ['Time', 'Pickup Location', 'Dropoff Location', 'Needs', 'Driver'];
  
  return (
    <Table>
      <Row
        header
        colSizes={hasAssignButton ? unscheduledHeaderColSizes : scheduledColSizes}
        data={hasAssignButton ? unscheduledHeaders.map((h) => ({ data: h })) 
          : scheduledHeaders.map((h) => ({ data: h }))}
      />
      {rides.filter((r) => r.startLocation !== undefined
      && r.endLocation !== undefined).map((ride, index) => {
        const startTime = new Date(ride.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endTime = new Date(ride.endTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const { rider, driver } = ride;
        const name = rider ? `${rider.firstName} ${rider.lastName}` : '';
        const needs = rider ? (rider.accessibilityNeeds || []).join(', ') : '';
        const pickupLocation = ride.startLocation.name;
        const pickupTag = ride.startLocation.tag;
        const dropoffLocation = ride.endLocation.name;
        const dropoffTag = ride.endLocation.tag;
        const assignedDriver = driver ? `${driver.firstName} ${driver.lastName}` : 'N/A';

        const timeframe = new Date(ride.startTime).toLocaleString('en-US', {
          hour: 'numeric',
          hour12: true,
        });
        const valueName = { data: name };
        const valuePickup = { data: pickupLocation, tag: pickupTag };
        const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
        const valueNeeds = { data: needs };
        const valueDriver = { data: assignedDriver };

        const startEndTime = {
          data:
            <span>
              <span className={styles.bold}>{startTime}</span>
              <span className={styles.gray}> -- {endTime}</span>
            </span>,
        };
        const assignModal = () => (
            <AssignDriverModal
              isOpen={openModal === index}
              close={() => setOpenModal(-1)}
              ride={rides[0]}
              allDrivers={drivers}
            />
        );
        const assignButton = {
          data: <Button onClick={() => setOpenModal(index)}>Assign
            { assignModal() }
            </Button>
        };
        const editRide = () => {
          console.log('edit ride button pressed!');
        };
        const editButton = {
          data: <Button onClick={() => editRide()}>Edit</Button>
        };
        const scheduledRideData = [
          startEndTime,
          valuePickup,
          valueDropoff,
          valueNeeds,
          valueDriver,
          editButton
        ];
        const unscheduledRideData = [
          valueName,
          valuePickup,
          valueDropoff,
          valueNeeds,
          assignButton,
        ];
        const scheduledRow = () => {
          return (
            <tr key={index} className={styles.ridesTableRow}>
              <Row data={scheduledRideData} colSizes={scheduledColSizes} />
            </tr>
          );
        };
        const unscheduledRow = () => {
          return (
            <tr key={index} className={styles.ridesTableRow}>
              <td className={styles.cell}>{timeframe}</td>
              <td className={styles.cell}>
                <span className={styles.bold}>{startTime}</span> <br></br>
                <span className={styles.gray}>-- {endTime}</span>
              </td>
              <Row data={unscheduledRideData} colSizes={unscheduledDataColSizes} />
            </tr>
          );
        };

        return (
          <div className={styles.divRow}>
            {hasAssignButton ? unscheduledRow() : scheduledRow()}
          </div>
          // <tr key={index}>
          //   <td className={styles.cell}>{timeframe}</td>
          //   <td className={styles.cell}>
          //     <span className={styles.bold}>{startTime}</span> <br></br>
          //     <span className={styles.gray}>-- {endTime}</span>
          //   </td>
          //   {hasAssignButton
          //     ? <Row data={unscheduledRideData} colSizes={unscheduledDataColSizes} />
          //     : <Row data={scheduledRideData} colSizes={scheduledDataColSizes} />}
          // </tr>
        );
      })}
    </Table>
  );
};

export default RidesTable;
