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
    <main id = "main">
      <section>
        <UserDetail
          firstName={rider.firstName}
          lastName={rider.lastName}
          netId={rider.netID}
          photoLink={rider.photoLink}
        >
          <UserContactInfo icon={phone} alt="phone" text={rider.phone} />
          <UserContactInfo icon="" alt="needs" text={rider.accessibility} />
          <OtherInfo>
            <p>other info:</p>
          </OtherInfo>
        </UserDetail>
    </section>
    <section>
      <PastRides
      isStudent = {true}
      rides={rides}
      />
     </section>
    </main>
  );
};

export default RiderDetail;
