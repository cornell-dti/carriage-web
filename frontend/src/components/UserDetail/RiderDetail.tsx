import React, { useEffect, useState } from 'react';
import UserDetail, { UserContactInfo, OtherInfo } from './UserDetail';
import { phone } from "../../icons/userInfo/index";
import { useLocation } from 'react-router-dom';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride } from '../../types';
import styles from './userDetail.module.css';

type RiderDetailProps = {
  photoLink: string;
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
    <div className={styles.detailContainer}>
      <UserDetail
        firstName={rider.firstName}
        lastName={rider.lastName}
        netId={rider.netID}
        photoLink={rider.photoLink}>
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
    </div>
  );
};

export default RiderDetail;
