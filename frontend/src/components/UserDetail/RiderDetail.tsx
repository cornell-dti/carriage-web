import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import UserDetail, { UserContactInfo } from './UserDetail';
import { phone, home } from '../../icons/userInfo/index';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride, Rider } from '../../types';
import styles from './userDetail.module.css';

const RiderDetail = () => {
  const location = useLocation<Rider>();
  const { withDefaults } = useReq();
  const { id: riderId } = useParams<{ id: string }>();
  const [rider, setRider] = useState(location.state);
  const [rides, setRides] = useState<Ride[]>([]);
  const netid = rider?.email.split('@')[0];
  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };

  useEffect(() => {
    if (riderId) {
      if (!rider) {
        fetch(`/api/riders/${riderId}`, withDefaults())
          .then((res) => res.json())
          .then((data) => setRider(data));
      }
      fetch(`/api/rides?type=past&rider=${riderId}`, withDefaults())
        .then((res) => res.json())
        .then(({ data }) => setRides(data.sort(compRides)));
    }
  }, [rider, riderId, withDefaults]);

  return rider
    ? <main id = "main" className={styles.detailContainer}>
      <UserDetail
        firstName={rider.firstName}
        lastName={rider.lastName}
        netId={netid}
        photoLink={rider.photoLink}
        rider={rider}
      >
        <div className={styles.riderContactInfo}>
          <UserContactInfo icon={phone} alt="" text={rider.phoneNumber} />
          <UserContactInfo icon={home} alt="" text={rider.address} />
        </div>
      </UserDetail>
      <PastRides
        isStudent={true}
        rides={rides}
      />
    </main>
    : null;
};

export default RiderDetail;
