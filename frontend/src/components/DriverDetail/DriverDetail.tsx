import React from 'react';
import { Vehicle } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from '../UserDetail/UserDetail';
import { phone, clock, wheel } from "./icons";
import { useLocation } from 'react-router-dom';

type DriverDetailProps = {
  // profilePic: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability: string[][]
  vehicle: Vehicle
}

const DriverDetail = () => {
  const location = useLocation<DriverDetailProps>();
  const driver: DriverDetailProps = location.state;
  const availToString = (acc: string, [day, timeRange]: string[]) => acc + day + ": " + timeRange + " • ";
  const parsedAvail = driver.availability.reduce(availToString, "");
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
