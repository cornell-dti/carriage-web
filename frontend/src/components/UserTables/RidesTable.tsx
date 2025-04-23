import React, { useState, useEffect, useRef } from 'react';
import { Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import AssignDriverModal from '../Modal/AssignDriverModal';
import RideModal from '../RideModal/RideModal';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { trashbig } from '../../icons/other/index';

type RidesTableProps = {
  rides: Ride[];
  hasButtons: boolean;
};

const RidesTable = ({ rides, hasButtons }: RidesTableProps) => {
  const { drivers } = useEmployees();
  const [openAssignModal, setOpenAssignModal] = useState(-1);
  const [openEditModal, setOpenEditModal] = useState(-1);
  const [openDeleteOrEditModal, setOpenDeleteOrEditModal] = useState(-1);
  const [editSingle, setEditSingle] = useState(false);
  const [reassign, setReassign] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(-1);
  const buttonRef = useRef(null);

  const unscheduledColSizes = [0.5, 0.5, 0.8, 1, 1, 0.8, 1];
  const unscheduledHeaders = [
    '',
    'Time',
    'Passenger',
    'Pickup Location',
    'Dropoff Location',
    'Needs',
    '',
  ];

  const scheduledColSizes = [1, 1, 1, 1, 1, 1];
  const scheduledHeaders = [
    'Time',
    'Pickup Location',
    'Dropoff Location',
    'Needs',
    'Rider',
    '',
  ];

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

          // Convert accessibility array to string
          const needs =
            rider && rider.accessibility && rider.accessibility.length > 0
              ? rider.accessibility.join(', ')
              : 'None';

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

          const startEndTime = {
            data: (
              <span>
                <p className={styles.bold}>{startTime}</p>
                <p className={styles.gray}> -- {endTime}</p>
              </span>
            ),
          };

          const assignButton = (shouldReassign: boolean) => (
            <Button
              className={styles.assignButton}
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setOpenAssignModal(openAssignModal === index ? -1 : index);
                setReassign(shouldReassign);
              }}
              small
            >
              {shouldReassign ? 'Reassign' : 'Assign'}
            </Button>
          );

          const editButton = (
            <Button
              outline
              small
              onClick={() => {
                if (rides[index].recurring) {
                  setOpenDeleteOrEditModal(index);
                } else {
                  setOpenEditModal(index);
                }
              }}
            >
              Edit
            </Button>
          );

          const deleteButton = (
            <button
              className={styles.deleteIcon}
              onClick={() => {
                //buttonRef = null;
                setDeleteOpen(index);
              }}
            >
              <img src={trashbig} alt="delete ride" />
            </button>
          );

          const valueEditAssign = {
            data: (
              <div className={styles.dataValues}>
                {editButton}
                {assignButton(false)}
                {deleteButton}
              </div>
            ),
          };

          const valueEditReassign = {
            data: (
              <div className={styles.dataValues}>
                {editButton}
                {assignButton(true)}
                {deleteButton}
              </div>
            ),
          };

          const scheduledRideData = [
            startEndTime,
            valuePickup,
            valueDropoff,
            needs,
            riderName,
            valueEditReassign,
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
            <Row
              key={ride.id}
              data={scheduledRideData}
              colSizes={scheduledColSizes}
            />
          );

          const unscheduledRow = () => (
            <Row
              key={ride.id}
              data={unscheduledRideData}
              colSizes={unscheduledColSizes}
              groupStart={2}
            />
          );

          return (
            <React.Fragment key={ride.id}>
              {hasButtons ? unscheduledRow() : scheduledRow()}
              <DeleteOrEditTypeModal
                key={`delete-edit-modal-${ride.id}`}
                open={deleteOpen === index}
                onClose={() => setDeleteOpen(-1)}
                ride={rides[index]}
                deleting={true}
                onNext={(single) => {
                  setOpenDeleteOrEditModal(-1);
                  setOpenEditModal(index);
                  setEditSingle(single);
                }}
                isRider={false}
              />
              <AssignDriverModal
                key={`assign-driver-modal-${ride.id}`}
                isOpen={openAssignModal === index}
                close={() => setOpenAssignModal(-1)}
                ride={rides[index]}
                allDrivers={drivers}
                reassign={reassign}
                buttonRef={buttonRef}
              />
              <RideModal
                key={`ride-modal-${ride.id}`}
                open={openEditModal === index}
                close={() => setOpenEditModal(-1)}
                ride={rides[index]}
                editSingle={editSingle}
              />
            </React.Fragment>
          );
        })}
      </Table>
    </>
  );
};

export default RidesTable;
