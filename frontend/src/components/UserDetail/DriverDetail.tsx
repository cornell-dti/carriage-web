import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Ride, Vehicle } from '../../types';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone, clock, wheel } from '../../icons/userInfo/index';
import { useReq } from '../../context/req';
import PastRides from './PastRides';

type DriverDetailProps = {
  // profilePic: string;
  id: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  availability: string[][];
  vehicle: Vehicle;
};

const DriverDetail = () => {
  const location = useLocation<DriverDetailProps>();
  const driver: DriverDetailProps = location.state;
  const availToString = (acc: string, [day, timeRange]: string[]) =>
    `${acc + day}: ${timeRange} • `;
  const parsedAvail = driver.availability.reduce(availToString, '');
  const avail = parsedAvail.substring(0, parsedAvail.length - 2);
  const vehicle = driver.vehicle
    ? `${driver.vehicle.name} (${driver.vehicle.capacity} people)`
    : '';
  const [rides, setRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();
  const testboolean = true; 
  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    fetch(`/api/rides?type=past&driver=${driver.id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, driver.id]);

  return (
    <>
      <UserDetail
        firstName={driver.firstName}
        lastName={driver.lastName}
        netId={driver.netId}
      >
        <UserContactInfo icon={phone} alt="" text={driver.phone} />
        <UserContactInfo icon={wheel} alt="" text={vehicle} />
        <UserContactInfo icon={clock} alt="" text={avail} />
        <OtherInfo>
          <p>last week:</p>
        </OtherInfo>
      </UserDetail>

     <PastRides
     isStudent = {false}
     rides={rides}
     />
    </>
  );
};

export default DriverDetail;
