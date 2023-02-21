import React, { useState } from 'react';
import moment from 'moment';
import { Ride, Type } from '../../types/index';
import { Row, Table } from '../TableComponents/TableComponents';
import styles from './table.module.css';

type RiderRidesTableProps = {
  rides: Ride[];
  isPast: boolean;
  email: string;
};

const RiderRidesTable = ({ rides, isPast, email }: RiderRidesTableProps) => {
  const colSizes = [1, 1, 1, 1, 1, 1];
  const headers = [
    'Date',
    'Time',
    'Pickup Location',
    'Dropoff Location',
    'Needs',
    'Outcome',
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
          const { rider } = ride;
          const needs = rider ? rider.accessibility || '' : '';

          // returns date in the format "MM/DD/YYYY"
          const formatDate = (date: string): string =>
            moment(date).format('MM/DD/YYYY');

          const startDate = formatDate(ride.startTime);

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

          const isOneHourBeforeRideStart = moment().isBefore(
            moment(ride.startTime).subtract(1, 'hour')
          );

          const unscheduledRideData = [
            startDate,
            startEndTime,
            valuePickup,
            valueDropoff,
            needs,
            valueStatus,
          ];

          return (
            <span key={ride.id}>
              <Row data={unscheduledRideData} colSizes={colSizes} />
            </span>
          );
        })}
      </Table>
    </>
  );
};

export default RiderRidesTable;
