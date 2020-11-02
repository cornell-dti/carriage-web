import React from 'react';
import UserDetail, { UserContactInfo, OtherInfo } from '../UserDetail/UserDetail';
import { phone, clock } from "./icons";
import { useLocation } from 'react-router-dom';

type RiderDetailProps = {
  // profilePic: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  // address: string;
  accessibility: string
}

const RiderDetail = () => {
  const location = useLocation<RiderDetailProps>();
  const rider: RiderDetailProps = location.state;
  return (
    <UserDetail
      firstName={rider.firstName}
      lastName={rider.lastName}
      netId={rider.netId}>
      <UserContactInfo icon={phone} alt="" text={rider.phone} />
      <UserContactInfo icon="" alt="" text={rider.accessibility} />
      <OtherInfo>
        <p>other info:</p>
      </OtherInfo>
    </UserDetail>
  )
}

export default RiderDetail
