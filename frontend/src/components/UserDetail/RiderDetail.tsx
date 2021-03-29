import React from 'react';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone } from "../../icons/userInfo/index";
import { useLocation } from 'react-router-dom';

type RiderDetailProps = {
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  accessibility: string;
  photoLink?: string;
}

const RiderDetail = () => {
  const location = useLocation<RiderDetailProps>();
  const rider: RiderDetailProps = location.state;
  return (
    <UserDetail
      firstName={rider.firstName}
      lastName={rider.lastName}
      netId={rider.netId}
      photoLink={rider.photoLink}
    >
      <UserContactInfo icon={phone} alt="" text={rider.phone} />
      <UserContactInfo icon="" alt="" text={rider.accessibility} />
      <OtherInfo>
        <p>other info:</p>
      </OtherInfo>
    </UserDetail>
  )
}

export default RiderDetail
