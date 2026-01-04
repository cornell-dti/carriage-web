import React, { useRef, useState } from 'react';
import { Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import AssignDriverModal from '../Modal/AssignDriverModal';
import RideModal from '../RideModal/RideModal';
import RideDetailsComponent from '../RideDetails/RideDetailsComponent';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import { useRides } from '../../context/RidesContext';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { trashbig } from '../../icons/other/index';
import buttonStyles from '../../styles/button.module.css';

type RidesTableProps = {
  rides: Ride[];
  hasButtons: boolean;
};

const RidesTable = ({ rides, hasButtons }: RidesTableProps) => {
  const { drivers } = useEmployees();
  const { getRideById } = useRides();
  const [openAssignModal, setOpenAssignModal] = useState(-1);
  const [openEditModal, setOpenEditModal] = useState(-1);
  const [openDeleteOrEditModal, setOpenDeleteOrEditModal] = useState(-1);
  const [editSingle, setEditSingle] = useState(false);
  const [reassign, setReassign] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(-1);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rideEditOpenId, setRideEditOpenId] = useState<string | null>(null);
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

  const scheduledColSizes = [0.5, 0.5, 1, 1, 1, 1, 1];
  const scheduledHeaders = [
    'Pickup Time',
    'Dropoff Time',
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
        {rides.filter((ride) => ride !== undefined).map((ride, index) => {
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
          const needsRenderer = () => {
            if (
              primaryRider &&
              primaryRider.accessibility &&
              primaryRider.accessibility.length > 0
            ) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {primaryRider.accessibility.map((accessibility) => (
                    <p style={{ textWrap: 'nowrap' }}>{accessibility}</p>
                  ))}
                </div>
              );
            }
            return <p>None</p>;
          };

          const needs = {
            data: needsRenderer(),
          };

          const pickupLocation = ride.startLocation.name;
          const pickupTag = ride.startLocation.tag;
          const dropoffLocation = ride.endLocation.name;
          const dropoffTag = ride.endLocation.tag;

          const valuePickup = { data: pickupLocation, tag: pickupTag };
          const valueDropoff = { data: dropoffLocation, tag: dropoffTag };

          const startTimeElement = {
            data: <p style={{ textWrap: 'nowrap' }}>{startTime}</p>,
          };

          const endTimeElement = {
            data: <p style={{ textWrap: 'nowrap' }}>{endTime}</p>,
          };

          // Task1

          const assignButton = (shouldReassign: boolean) => (
            <button
              className={`${buttonStyles.button} ${
                shouldReassign
                  ? buttonStyles.buttonSecondary
                  : buttonStyles.buttonPrimary
              }`}
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setOpenAssignModal(openAssignModal === index ? -1 : index);
                setReassign(shouldReassign);
              }}
            >
              {shouldReassign ? 'Reassign' : 'Assign'}
            </button>
          );

          const editButton = (
            <button
              className={`${buttonStyles.button} ${buttonStyles.buttonSecondary}`}
              onClick={() => {
                if (rides[index].isRecurring) {
                  setOpenDeleteOrEditModal(index);
                } else {
                  setRideEditOpenId(ride.id);
                }
              }}
            >
              Edit
            </button>
          );

          const valueEdit = {
            data: (
              <div
                className={styles.dataValues}
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                {editButton}
                {assignButton(ride.driver !== undefined)}
              </div>
            ),
          };

          const scheduledRideData = [
            startTimeElement,
            endTimeElement,
            valuePickup,
            valueDropoff,
            needs,
            riderName,
            valueEdit,
          ];

          const handleRowClick = () => {
            setSelectedRide(ride);
            setDetailsModalOpen(true);
          };

          const scheduledRow = () => (
            <Row
              key={ride.id}
              data={scheduledRideData}
              colSizes={scheduledColSizes}
              onClick={handleRowClick}
            />
          );

          return (
            <React.Fragment key={ride.id}>
              {scheduledRow()}
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
      {rideEditOpenId && getRideById(rideEditOpenId) && (
        <RideDetailsComponent
          open={!!rideEditOpenId}
          onClose={() => setRideEditOpenId(null)}
          ride={getRideById(rideEditOpenId)!}
          initialEditingState={true}
        />
      )}
    </>
  );
};

export default RidesTable;
