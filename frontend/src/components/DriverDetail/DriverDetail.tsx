import React from 'react';
import { Vehicle } from '../../types';
import styles from './driverDetail.module.css';
import UserDetail, { UserContactInfo, OtherInfo } from '../UserDetail/UserDetail';
import { phone, clock, wheel } from "./icons";

type DriverDetailProps = {
  // profilePic: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability: string[][]
  vehicle: Vehicle
}

const DriverDetail = (props: any) => {
  console.log("driver detail running");
  const driver: DriverDetailProps = props.location.state;
  console.log("driver", driver);
  const reducer = (acc: string, [day, timeRange]: string[]) => acc + day + ": " + timeRange + " • ";
  const parsedAvail = driver.availability.reduce(reducer, "");
  const avail = parsedAvail.substring(0, parsedAvail.length - 2);
  const vehicle = driver.vehicle ? (driver.vehicle.name + " (" + driver.vehicle.capacity + " people)") : ""
  return (
    <UserDetail
      firstName={driver.firstName}
      lastName={driver.lastName}
      netId={driver.netId}>
      <UserContactInfo icon={phone} alt="" text={driver.phone} />
      <UserContactInfo icon={wheel} alt="" text={vehicle} />
      <UserContactInfo icon={clock} alt="" text={avail} />
      <OtherInfo>
        <p>last week:</p>
      </OtherInfo>
    </UserDetail>
  )
}

export default DriverDetail
