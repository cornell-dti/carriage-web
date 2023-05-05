import React, { useState } from 'react';
import moment from 'moment';
import DeleteOrEditTypeModal from '../Modal/DeleteOrEditTypeModal';
import { Ride, Type } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { trashbig } from '../../icons/other';
import styles from './table.module.css';
import RequestRideModal from '../RequestRideModal/RequestRideModal';

type RiderRidesTableProps = {
  rides: Ride[];
  isPast: boolean;
};

const RiderRidesTable = ({ rides, isPast }: RiderRidesTableProps) => {
  const [deleteOpen, setDeleteOpen] = useState(-1);
  const colSizes = [1, 1, 1, 1.25, 1, 1];
  const headers = [
    'Time',
    'Pickup Location',
    'Dropoff Location',
    'This ride repeats...',
    'Status',
    '',
  ];

  return (
    <>
      <Table>
        <Row header colSizes={colSizes} data={headers} />
        {rides.map((ride, index) => {
          const startTime = new Date(ride.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endTime = new Date(ride.endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const pickupLocation = ride.startLocation.name;
          const pickupTag = ride.startLocation.tag;
          const dropoffLocation = ride.endLocation.name;
          const dropoffTag = ride.endLocation.tag;

          // returns date in the format "MM/DD/YYYY"
          const formatDate = (date: string): string =>
            moment(date).format('MM/DD/YYYY');

          const startDate = formatDate(ride.endTime);
          const weekdays = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

          const formatWeekdays = (recurringDays: number[]): string => {
            const letters: string[] = [];
            recurringDays.forEach((day) => {
              letters.push(weekdays[day]);
            });
            return letters.join(', ');
          };

          const isRecurring = ride.recurring;
          const recurringDays = isRecurring
            ? formatWeekdays(ride.recurringDays!)
            : 'Not repeating';
          const endDate = isRecurring ? formatDate(ride.endDate!) : 'N/A';
          const recurringDateRange = isRecurring
            ? `${startDate}-${endDate}`
            : undefined;

          const startEndTime = {
            data: (
              <p>
                <span className={styles.bold}>{startTime}</span>
                <span className={styles.gray}> -- {endTime}</span>
              </p>
            ),
          };
          const valuePickup = { data: pickupLocation, tag: pickupTag };
          const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
          const valueRepeat = {
            data: (
              <p>
                {recurringDays}
                <span className={styles.highlight}> {recurringDateRange}</span>
              </p>
            ),
          };

          let valueStatus;
          switch (ride.type) {
            case Type.UNSCHEDULED:
              valueStatus = 'Requested';
              break;
            case Type.ACTIVE:
              valueStatus = 'Confirmed';
              break;
            default:
              valueStatus = 'Past';
          }

          const editButton = <RequestRideModal ride={ride} />;

          const deleteButton = (
            <button
              className={styles.deleteIcon}
              onClick={() => setDeleteOpen(index)}
            >
              <img src={trashbig} alt="delete ride" />
            </button>
          );

          const onClose = () => {
            setDeleteOpen(-1);
          };

          const isOneHourBeforeRideStart = moment().isBefore(
            moment(ride.startTime).subtract(1, 'hour')
          );

          const valueEditDelete = {
            data: !isPast ? (
              <>
                {ride.type === Type.UNSCHEDULED && editButton}
                {isOneHourBeforeRideStart && deleteButton}
              </>
            ) : null,
          };

          const unscheduledRideData = [
            startEndTime,
            valuePickup,
            valueDropoff,
            valueRepeat,
            valueStatus,
            valueEditDelete,
          ];

          return (
            <span key={ride.id}>
              <DeleteOrEditTypeModal
                open={deleteOpen === index}
                ride={ride}
                onClose={onClose}
                deleting={true}
              />
              <Row
                data={unscheduledRideData}
                smallTag={false}
                colSizes={colSizes}
              />
            </span>
          );
        })}
      </Table>
    </>
  );
};

export default RiderRidesTable;
