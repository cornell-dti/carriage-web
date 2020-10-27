import React from 'react';
import UserDetail, { UserContactInfo, OtherInfo } from '../UserDetail/UserDetail';
import { phone, clock } from "./icons";

type RiderDetailProps = {
  // profilePic: string;
  firstName: string;
  lastName: string;
  netId: string;
  phone: string;
  // address: string;
  accessibility: string
}

const RiderDetail = (props: any) => {
  const rider: RiderDetailProps = props.location.state;
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
