import React, { useState } from 'react';
import { Driver, Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import AssignDriverModal from '../Modal/AssignDriverModal';
import RideModal from '../RideModal/RideModal';
import styles from './table.module.css';

type RidesTableProps = {
  rides: Ride[];
  drivers: Driver[];
  hasButtons: boolean;
}

const RidesTable = ({ rides, drivers, hasButtons }: RidesTableProps) => {
  const [openAssignModal, setOpenAssignModal] = useState(-1);
  const [openEditModal, setOpenEditModal] = useState(-1);
  const [driverSet, setDriverSet] = useState(['']);

  const unscheduledColSizes = [0.5, 0.5, 0.8, 1, 1, 0.8, 1];
  const unscheduledHeaders = ['', 'Time', 'Passenger', 'Pickup Location', 'Dropoff Location', 'Needs', ''];

  const scheduledColSizes = [1, 1, 1, 1, 1, 1];
  const scheduledHeaders = ['Time', 'Pickup Location', 'Dropoff Location', 'Needs', 'Rider'];

  return (
    <>
      <Table>
        <Row
          header
          colSizes={hasButtons ? unscheduledColSizes : scheduledColSizes}
          data={hasButtons ? unscheduledHeaders : scheduledHeaders}
        />
        {rides.map((ride, index) => {
          const startTime = new Date(ride.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endTime = new Date(ride.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const { rider } = ride;
          const riderName = rider ? `${rider.firstName} ${rider.lastName}` : '';
          const needs = rider ? (rider.accessibility || []).join(', ') : '';
          const pickupLocation = ride.startLocation.name;
          const pickupTag = ride.startLocation.tag;
          const dropoffLocation = ride.endLocation.name;
          const dropoffTag = ride.endLocation.tag;

          const timeframe = new Date(ride.startTime).toLocaleString('en-US', {
            hour: 'numeric',
            hour12: true,
          });
          const valuePickup = { data: pickupLocation, tag: pickupTag };
          const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
          const hasDriver = (driverSet[index] !== undefined
            && driverSet[index].length > 0);

          const startEndTime = {
            data:
              <span>
                <p className={styles.bold}>{startTime}</p>
                <p className={styles.gray}> -- {endTime}</p>
              </span>,
          };

          const assignButton = (
            <Button className={styles.assignButton} onClick={() => setOpenAssignModal(index)} small>
              Assign
            </Button>
          );

          const editButton = (
            <Button outline small onClick={() => setOpenEditModal(index)}>Edit</Button>
          );

          const valueEditAssign = {
            data: <>
              {editButton}
              {assignButton}
            </>,
          };

          const valueEdit = {
            data: editButton,
          };

          const scheduledRideData = [
            startEndTime,
            valuePickup,
            valueDropoff,
            needs,
            riderName,
            valueEdit,
          ];

          const unscheduledRideData = [
            timeframe,
            startEndTime,
            riderName,
            valuePickup,
            valueDropoff,
            needs,
            valueEditAssign,
          ];

          const scheduledRow = () => (
            <Row data={scheduledRideData} colSizes={scheduledColSizes} />
          );

          const unscheduledRow = () => (
            <Row data={unscheduledRideData} colSizes={unscheduledColSizes} groupStart={2} />
          );

          return (
            <>
              {hasButtons ? unscheduledRow() : scheduledRow()}
              <AssignDriverModal
                isOpen={(openAssignModal === index) && !hasDriver}
                close={() => setOpenAssignModal(-1)}
                setDriver={(driverName: string) => {
                  driverSet[index] = driverName;
                  setDriverSet([...driverSet]);
                }}
                ride={rides[index]}
                allDrivers={drivers}
              />
              <RideModal
                open={openEditModal === index}
                close={() => setOpenEditModal(-1)}
                ride={rides[index]}
              />
            </>
          );
        })}
      </Table>
    </>
  );
};

export default RidesTable;
