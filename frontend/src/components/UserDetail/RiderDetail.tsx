import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useParams, Link } from 'react-router-dom';
import UserDetail, { UserContactInfo } from './UserDetail';
import { phone, home, calendar } from '../../icons/userInfo/index';
import PastRides from './PastRides';
import { useReq } from '../../context/req';
import { Ride } from '../../types';
import styles from './userDetail.module.css';
import { useRiders } from '../../context/RidersContext';
import { chevronLeft } from '../../icons/other';

const Header = () => {
  return (
    <div className={styles.pageDivTitle}>
      <Link
        to={{
          pathname: '/riders',
        }}
        className={styles.header}
      >
        <img className={styles.chevronLeft} src={chevronLeft} />
        Students
      </Link>
    </div>
  );
};

const RiderDetail = () => {
  const { withDefaults } = useReq();
  const { id: riderId } = useParams<{ id: string }>();
  const { riders } = useRiders();
  const [rider, setRider] = useState(
    riders.find((rider) => rider.id === riderId)
  );
  const [rides, setRides] = useState<Ride[]>([]);
  const netid = rider?.email.split('@')[0];
  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return -1;
    if (x > y) return 1;
    return 0;
  };
  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

  useEffect(() => {
    if (rider) {
      document.title = `${rider.firstName} ${rider.lastName} - Carriage`;
    } else {
      document.title = 'Rider Details - Carriage';
    }
  }, [rider]);

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
    setRider(riders.find((rider) => rider.id === riderId));
  }, [rider, riders, riderId, withDefaults]);

  return rider ? (
    <main id="main">
      <Header />
      <div className={styles.detailContainer}>
        <UserDetail
          firstName={rider.firstName}
          lastName={rider.lastName}
          netId={netid!}
          photoLink={rider.photoLink}
          rider={rider}
        >
          <div className={styles.riderContactInfo}>
            <UserContactInfo
              icon={phone}
              alt="phone number"
              text={rider.phoneNumber}
            />
            <UserContactInfo icon={home} alt="address" text={rider.address} />
            <UserContactInfo
              icon={calendar}
              alt="active dates"
              text={`${formatDate(rider.joinDate)} - ${formatDate(
                rider.endDate
              )}`}
            />
          </div>
        </UserDetail>
        <PastRides isStudent={true} rides={rides} />
      </div>
    </main>
  ) : null;
};

export default RiderDetail;
