import React, { useRef, useState } from 'react';
import { Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import AssignDriverModal from '../Modal/AssignDriverModal';
import RideModal from '../RideModal/RideModal';
import RideDetailsComponent from '../RideDetails/RideDetailsComponent';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import CancelRideConfirmationDialog from '../Modal/CancelRideConfirmationDialog';
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
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [rideToCancel, setRideToCancel] = useState<Ride | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rideEditOpenIndex, setRideEditOpenIndex] = useState(-1);
  let buttonRef = useRef(null);

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedRide(null);
  };

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
          // Use primary rider (first in array) for table display
          const primaryRider =
            ride.riders && ride.riders.length > 0 ? ride.riders[0] : null;
          const riderName = primaryRider
            ? `${primaryRider.firstName} ${primaryRider.lastName}`
            : '';

          // Convert accessibility array to string
          const needs =
            primaryRider &&
            primaryRider.accessibility &&
            primaryRider.accessibility.length > 0
              ? primaryRider.accessibility.join(', ')
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

          // Task1

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
                if (rides[index].isRecurring) {
                  setOpenDeleteOrEditModal(index);
                } else {
                  setRideEditOpenIndex(index);
                }
              }}
            >
              Edit
            </Button>
          );

          const deleteButton = (
            <button
              className={styles.deleteIcon}
              onClick={(e) => {
                e.stopPropagation();
                setRideToCancel(rides[index]);
                setCancelConfirmOpen(true);
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

          const handleCellClick = () => {
            // Open ride details modal when clicking on specific cells
            setSelectedRide(ride);
            setDetailsModalOpen(true);
          };

          // Wrap clickable cells in a span with onClick handler
          const makeClickable = (cellData: any) => {
            return {
              ...cellData,
              data: (
                <span
                  onClick={handleCellClick}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  {cellData.data}
                </span>
              ),
            };
          };

          // For scheduled rides: make pickup (1), dropoff (2), needs (3), rider (4) clickable
          const scheduledRideDataClickable = [
            startEndTime, // 0 - Time (not clickable)
            makeClickable(valuePickup), // 1 - Pickup (clickable)
            makeClickable(valueDropoff), // 2 - Dropoff (clickable)
            makeClickable({ data: needs }), // 3 - Needs (clickable)
            makeClickable({ data: riderName }), // 4 - Rider (clickable)
            valueEditReassign, // 5 - Buttons (not clickable)
          ];

          // For unscheduled rides: make rider (2), pickup (3), dropoff (4), needs (5) clickable
          const unscheduledRideDataClickable = [
            timeframe, // 0 - Timeframe (not clickable)
            startEndTime, // 1 - Time (not clickable)
            makeClickable({ data: riderName }), // 2 - Rider (clickable)
            makeClickable(valuePickup), // 3 - Pickup (clickable)
            makeClickable(valueDropoff), // 4 - Dropoff (clickable)
            makeClickable({ data: needs }), // 5 - Needs (clickable)
            valueEditAssign, // 6 - Buttons (not clickable)
          ];

          const scheduledRow = () => (
            <Row
              key={ride.id}
              data={scheduledRideDataClickable}
              colSizes={scheduledColSizes}
            />
          );

          const unscheduledRow = () => (
            <Row
              key={ride.id}
              data={unscheduledRideDataClickable}
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

      {/* Ride Details Modal */}
      {selectedRide && (
        <RideDetailsComponent
          open={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          ride={selectedRide}
        />
      )}

      {/* Ride Edit Modal */}
      {rideEditOpenIndex >= 0 && (
        <RideDetailsComponent
          open={rideEditOpenIndex >= 0}
          onClose={() => setRideEditOpenIndex(-1)}
          ride={rides[rideEditOpenIndex]}
          initialEditingState={true}
        />
      )}

      {/* Cancel Ride Confirmation Dialog */}
      {rideToCancel && (
        <CancelRideConfirmationDialog
          open={cancelConfirmOpen}
          onClose={() => {
            setCancelConfirmOpen(false);
            setRideToCancel(null);
          }}
          ride={rideToCancel}
          userRole="admin"
        />
      )}
    </>
  );
};

export default RidesTable;
