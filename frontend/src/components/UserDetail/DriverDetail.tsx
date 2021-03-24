import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TableRow from '../TableComponents/TableRow';
import { Ride } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone, clock, wheel, user } from '../../icons/userInfo/index';
import styles from '../UserTables/table.module.css';
import { useReq } from '../../context/req';

function renderTableHeader() {
  return (
    <tr>
      <th className={styles.tableHeader}>Name</th>
      <th className={styles.tableHeader}>Date</th>
      <th className={styles.tableHeader}>Pickup Location</th>
      <th className={styles.tableHeader}>Dropoff Location</th>
      <th className={styles.tableHeader}>Needs</th>
    </tr>
  );
}

type DriverDetailProps = {
  // profilePic: string;
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability: string[][];
  admin: boolean;
};

const DriverDetail = () => {
  const location = useLocation<DriverDetailProps>();
  const driver: DriverDetailProps = location.state;
  const availToString = (acc: string, [day, timeRange]: string[]) => `${acc + day}: ${timeRange} • `;
  const parsedAvail = driver.availability.reduce(availToString, '');
  const avail = parsedAvail.substring(0, parsedAvail.length - 2);
  const role = driver.admin ? 'Admin' : 'Driver';
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();

  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    fetch(`/rides?type=past&driver=${driver.id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, driver.id]);

  function renderTableData(allRides: Ride[]) {
    return allRides.map((ride, index) => {
      const date = new Date(ride.startTime).toLocaleDateString();
      const { rider } = ride;
      const name = `${rider.firstName} ${rider.lastName}`;
      const needs = (rider.accessibilityNeeds || []).join(', ');
      const pickupLocation = ride.startLocation.name;
      const pickupTag = ride.startLocation.tag;
      const dropoffLocation = ride.endLocation.name;
      const dropoffTag = ride.endLocation.tag;

      const valueName = { data: name };
      const valueDate = { data: date };
      const valuePickup = { data: pickupLocation, tag: pickupTag };
      const valueDropoff = { data: dropoffLocation, tag: dropoffTag };
      const valueNeeds = { data: needs };

      const inputValues = [
        valueName,
        valueDate,
        valuePickup,
        valueDropoff,
        valueNeeds,
      ];

      return (
        <tr key={index}>
          <TableRow values={inputValues} />
        </tr>
      );
    });
  }

  return (
    <>
      <UserDetail
        firstName={driver.firstName}
        lastName={driver.lastName}
        netId={driver.netId}
      >
        <UserContactInfo icon={phone} alt="" text={driver.phone} />
        <UserContactInfo icon={driver.admin ? user : wheel} alt="" text={role} />
        <UserContactInfo icon={clock} alt="" text={avail} />
        <OtherInfo>
          <p>last week:</p>
        </OtherInfo>
      </UserDetail>

      <div>
        <h1 className={styles.formHeader}>Past Rides</h1>
        <div className={styles.tableContainer}>
          <table cellSpacing="0" className={styles.table}>
            <tbody>
              {renderTableHeader()}
              {renderTableData(rides)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DriverDetail;
