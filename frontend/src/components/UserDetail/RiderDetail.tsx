import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import UserDetail, { UserContactInfo } from './UserDetail';
import { phone, home, calendar } from '../../icons/userInfo/index';
import PastRides from './PastRides';
import { Ride } from '../../types';
import styles from './userDetail.module.css';
import { useRiders } from '../../context/RidersContext';
import { chevronLeft } from '../../icons/other';
import axios from '../../util/axios';
import StudentRidesTable from 'components/UserTables/StudentRidesTable';

const Header = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className={styles.pageDivTitle}>
      <button
        onClick={onBack}
        className={styles.header}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
        }}
      >
        <img className={styles.chevronLeft} src={chevronLeft} alt="Back" />
        Students
      </button>
    </div>
  );
};

const RiderDetail = () => {
  const navigate = useNavigate();
  const { id: riderId } = useParams<{ id: string }>();
  const { riders } = useRiders();
  const [rider, setRider] = useState(
    riders.find((rider) => rider.id === riderId)
  );
  const now = new Date().toISOString();
  const [rides, setRides] = useState<Ride[]>([]);
  const netid = rider?.email.split('@')[0];
  const componentMounted = useRef(true);

  const handleBack = () => {
    navigate('/admin/riders');
  };

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

  const refreshRides = useCallback(() => {
    axios
      .get(`/api/rides/rider/${riderId}`)
      .then((res) => res.data)
      .then(({ data }) => {
        if (componentMounted.current) {
          setRides([...data]);
        }
      })
      .catch(() => {
        if (componentMounted.current) {
          setRides([]); // Return nothing instead of showing an error
        }
      });
  }, [riderId]);

  useEffect(() => {
    refreshRides();

    return () => {
      componentMounted.current = false;
    };
  }, [refreshRides, rides]);

  useEffect(() => {
    if (riderId) {
      if (!rider) {
        axios
          .get(`/api/riders/${riderId}`)
          .then((res) => res.data)
          .then(({ data }) => setRider(data));
      }
    }
    setRider(riders.find((rider) => rider.id === riderId));
  }, [rider, riders, riderId]);

  return rider ? (
    <main id="main">
      <Header onBack={handleBack} />
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
              text={rider.phoneNumber ?? ''}
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
        <StudentRidesTable rides={rides} />
      </div>
    </main>
  ) : null;
};

export default RiderDetail;
