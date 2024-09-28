import React, { useState } from 'react';
import { Driver, Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import AssignDriverModal from '../Modal/AssignDriverModal';
import RideModal from '../RideModal/RideModal';
import styles from './table.module.css';
import { useEmployees } from '../../context/EmployeesContext';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { trashbig } from '../../icons/other/index';
import { DriverType } from '../../../../server/src/models/driver';
import { start } from 'repl';

type RidesTableProps = {
  rides: Ride[];
  hasButtons: boolean;
};


/**
 * Summary: check if a driver is available on a certain day  based on their availability property. 
 * @param driver 
 * @param day : is a number from 0 to 6 representing 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
 * @returns whether driver is available on that day.
 */
const isAvailableOnDay = (driver: DriverType, day: number) => {
  const dayAsString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (const [key, value] of Object.entries(driver.availability)) {
    if (key === dayAsString.at(day) && value != undefined) {
      return true;
    }
  }
  return false;
};


// You can add additional filters to filter our drivers to reassign here.
const driverFilters: ((driver: DriverType) => boolean)[] = [
  // (driver: DriverType) => {
  //   return driver.firstName != 'Naoya';
  // },
];


const checkAdditionalFilters = (driver: DriverType) => {
  return driverFilters.every((fn) => fn(driver));
};


/**
 * summary: checks if a driver is availble between startTime and endTime based on their availability property.
 * @param driver 
 * @param startTime 
 * @param endTime 
 * @returns whether driver is available between these 2 times.
 */
const isAvailable = (driver: DriverType, startTime: Date, endTime: Date) => {
  const dayAsString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startTimeDay = startTime.getDay();
  const endTimeDay = endTime.getDay();
  if (
    isAvailableOnDay(driver, startTimeDay) &&
    isAvailableOnDay(driver, endTimeDay)
  ) {
    const startDay = dayAsString[
      startTimeDay
    ] as keyof typeof driver.availability;
    const endDay = dayAsString[
      endTimeDay
    ] as keyof typeof driver.availability;
    const driverStartDayAvailibility = driver.availability[startDay]; // hh:mm even for h <10
    const driverEndDayAvailibility = driver.availability[endDay];
    return (
      driverStartDayAvailibility!.startTime <=
        startTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) &&
      driverEndDayAvailibility!.endTime >=
        endTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
    );
  }
  return false;
};

const RidesTable = ({ rides, hasButtons }: RidesTableProps) => {
  const { drivers } = useEmployees();
  const [openAssignModal, setOpenAssignModal] = useState(-1);
  const [openEditModal, setOpenEditModal] = useState(-1);
  const [openDeleteOrEditModal, setOpenDeleteOrEditModal] = useState(-1);
  const [editSingle, setEditSingle] = useState(false);
  const [reassign, setReassign] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(-1);


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
          const needs = rider ? rider.accessibility || '' : '';
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
              onClick={() => {
                setOpenAssignModal(index);
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
                allDrivers={drivers.filter((driver) => {
                  return isAvailable(
                    driver,
                    new Date(ride.startTime),
                    new Date(ride.endTime)
                  );
                })}
                reassign={reassign}
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
