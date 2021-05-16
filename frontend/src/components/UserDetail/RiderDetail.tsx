import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UserDetail, { UserContactInfo } from './UserDetail';
import { phone, home } from '../../icons/userInfo/index';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride } from '../../types';
import styles from './userDetail.module.css';

type RiderDetailProps = {
  id: string;
  firstName: string;
  lastName: string;
  netID: string;
  phone: string;
  accessibility: string;
  photoLink?: string;
  address: string;
}

const RiderDetail = () => {
  const location = useLocation<RiderDetailProps>();
  const { withDefaults } = useReq();
  const { id: riderId } = useParams<{ id: string }>();
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
<<<<<<< HEAD
    fetch(`/api/rides?type=past&rider=${rider.id}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => setRides(data.sort(compRides)));
  }, [withDefaults, rider.id]);
  return (
    <div className={styles.detailContainer}>
      <UserDetail
        firstName={rider.firstName}
        lastName={rider.lastName}
        netId={rider.netID}
        photoLink={rider.photoLink}
      >
        <div className={styles.riderContactInfo}>
          <UserContactInfo icon={phone} alt="" text={rider.phone} />
          <UserContactInfo icon={home} alt="" text={rider.address} />
        </div>
      </UserDetail>
      <PastRides
        isStudent={true}
        rides={rides}
      />
    </div>
=======
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
>>>>>>> master
  );
};

export default RiderDetail;
