import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone } from '../../icons/userInfo/index';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride } from '../../types';

type RiderDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netID: string;
  phone: string;
  accessibility: string;
  photoLink?: string;
}

const RiderDetail = () => {
  const location = useLocation<RiderDetailProps>();
  const { withDefaults } = useReq();
  const riderId = location.pathname.split('/')[3];
  const [rider, setRider] = useState(location.state);
  const [rides, setRides] = useState<Ride[]>([]);
  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    if (riderId && !rider) {
      fetch(`/api/riders/${riderId}`, withDefaults())
        .then((res) => res.json())
        .then((data) => setRider(data));
      fetch(`/api/rides?type=past&rider=${riderId}`, withDefaults())
        .then((res) => res.json())
        .then(({ data }) => setRides(data.sort(compRides)));
    }
  }, [rider, riderId, withDefaults]);

  return (
    <>
      {rider && <>
        <UserDetail
          firstName={rider.firstName}
          lastName={rider.lastName}
          netId={rider.netID}
          photoLink={rider.photoLink}
        >
          <UserContactInfo icon={phone} alt="" text={rider.phone} />
          <UserContactInfo icon="" alt="" text={rider.accessibility} />
          <OtherInfo>
            <p>other info:</p>
          </OtherInfo>
        </UserDetail>
        <PastRides
          isStudent={true}
          rides={rides}
        />
      </>} </>
  );
};

export default RiderDetail;
