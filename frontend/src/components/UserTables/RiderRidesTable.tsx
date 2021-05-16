import React from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import { Button } from '../FormElements/FormElements';
import { trash } from '../../icons/other';
import styles from './table.module.css';

type RiderRidesTableProps = {
  rides: Ride[];
}

const RiderRidesTable = ({ rides }: RiderRidesTableProps) => {
  const colSizes = [1, 1, 1, 1, 1];
  const headers = ['Time', 'Pickup Location', 'Dropoff Location', 'This ride repeats...', ''];

  return (
    <>
      <Table>
        <Row
          header
          colSizes={colSizes}
          data={headers}
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
          const pickupLocation = ride.startLocation.name;
          const pickupTag = ride.startLocation.tag;
          const dropoffLocation = ride.endLocation.name;
          const dropoffTag = ride.endLocation.tag;

          // returns date in the format "MM/DD/YYYY"
          const formatDate = (date: string): string => {
            return moment(date).format('MM/DD/YYYY');
          };

          const startDate = formatDate(ride.startTime);
          const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

          const formatWeekdays = (recurringDays: number[]): string => {
            let letters: string[] = [];
            recurringDays.forEach(day => {
              if (day === 4) // 'Th' if day is Thursday to distinguish from Tuesday
                letters.push(weekdays[day].substring(0,2));
              else 
                letters.push(weekdays[day].charAt(0));
            });
            return letters.join(', ');
          };

          const isRecurring = ride.recurring;
          const recurringDays = isRecurring ? 
                        formatWeekdays(ride.recurringDays!) : 'Not repeating';
          const endDate = isRecurring ? formatDate(ride.endDate!) : 'N/A';
          const recurringDateRange = isRecurring ? `${startDate}-${endDate}` : undefined;

          const startEndTime = {
            data:
              <p>
                <span className={styles.bold}>{startTime}</span>
                <span className={styles.gray}> -- {endTime}</span>
              </p>,
          };
          const valuePickup = { data: pickupLocation, tag: pickupTag };
          const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
          const valueRepeat = { 
            data: 
            <p>
              {recurringDays}
              <span className={styles.bold}>  {recurringDateRange}</span>
            </p>
          };

          const editRide = () => {
            console.log('edit ride button pressed!');
          };

          const editButton = (
            <Button outline small onClick={() => editRide()}>Edit</Button>
          );

          const deleteButton = (
            <img className={styles.deleteIcon} src={trash} alt='delete ride' />
          );

          const valueEditDelete = {
            data: <>
              {editButton}
              {deleteButton}
            </>,
          };

          const unscheduledRideData = [
            startEndTime,
            valuePickup,
            valueDropoff,
            valueRepeat,
            valueEditDelete
          ];

          return (
            <Row data={unscheduledRideData} colSizes={colSizes} />
          );
        })}
      </Table>
    </>
  );
};

export default RiderRidesTable;
