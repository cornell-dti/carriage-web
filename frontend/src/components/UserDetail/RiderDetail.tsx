import React, { useEffect, useState } from 'react';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone } from "../../icons/userInfo/index";
import { useLocation } from 'react-router-dom';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride } from '../../types';

type RiderDetailProps = {
  // profilePic: string;
  id: string;
  firstName: string;
  lastName: string;
  netID: string;
  phone: string;
  // address: string;
  accessibility: string
}

const RiderDetail = () => {
  const location = useLocation<RiderDetailProps>();
  const rider: RiderDetailProps = location.state;
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
    fetch(`/api/rides?type=past&rider=${rider.id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, rider.id]);
  
  return (
    <>
    <UserDetail
      firstName={rider.firstName}
      lastName={rider.lastName}
      netId={rider.netID}>
      <UserContactInfo icon={phone} alt="" text={rider.phone} />
      <UserContactInfo icon="" alt="" text={rider.accessibility} />
      <OtherInfo>
        <p>other info:</p>
      </OtherInfo>
    </UserDetail>
    <PastRides
     isStudent = {true}
     rides={rides}
     />
    </>
  );
};

export default RiderDetail;
