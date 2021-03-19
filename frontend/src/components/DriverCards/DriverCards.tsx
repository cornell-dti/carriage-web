import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardInfo } from '../Card/Card';
import styles from './drivercards.module.css';
import { capacity, clock, phone, wheel } from '../../icons/userInfo/index';
import { Driver, AvailabilityType } from '../../types';
import {useDrivers} from '../../context/DriversContext';

const formatTime = (time: string) => {
  const hours = Number(time.split(':')[0]);
  // set fmtHours to 12 if hours is multiple of 12
  const fmtHours = hours % 12 || 12;
  return `${fmtHours}${hours < 12 ? 'am' : 'pm'}`;
};

const formatAvailability = (availability: AvailabilityType) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const availabilityList = days.reduce((acc, day) => {
    const availabilityTimes = availability[day];
    if (availabilityTimes) {
      const { startTime, endTime } = availabilityTimes;
      const fmtStart = formatTime(startTime);
      const fmtEnd = formatTime(endTime);
      acc.push([day, `${fmtStart}-${fmtEnd}`]);
    }
    return acc;
  }, [] as string[][]);
  return availabilityList;
};

const formatPhone = (phoneNumber: string) => {
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type DriverCardProps = {
  id: string,
  driver: Driver;
}

const DriverCard = ({
  id,
  driver: {
    firstName,
    lastName,
    email,
    phoneNumber,
    availability,
    vehicle,
    photoLink
  },
}: DriverCardProps) => {
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const fmtAvailability = formatAvailability(availability);
  const fullName = `${firstName}_${lastName}`;
  const userInfo = {
    id,
    firstName,
    lastName,
    netId,
    phone: fmtPhone,
    availability: fmtAvailability,
    vehicle,
    photoLink
  };

  return (
    <Link to={{ pathname: '/drivers/driver', state: userInfo, search: `?name=${fullName}` }}
      style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card 
        firstName={firstName} 
        lastName={lastName} 
        netId={netId} 
        photoLink={'http://' + photoLink}
      >
        <CardInfo icon={phone} alt="phone icon">
          <p>{fmtPhone}</p>
        </CardInfo>
        <CardInfo icon={clock} alt="clock icon">
          <div>
            {fmtAvailability.map(([day, timeRange]) => (
              <p key={day}><b>{day}:</b> {timeRange}</p>
            ))}
          </div>
        </CardInfo>
        <CardInfo icon={wheel} alt="wheel icon">
          <p>{`${vehicle.name} | ${vehicle.capacity}`}</p>
          <img src={capacity} alt="capacity icon" style={{ marginLeft: '0.1rem' }} />
        </CardInfo>
      </Card>
    </Link>
  );
};
const DriverCards = () => { 
  const {
    drivers,
  } = useDrivers();

  return (
    <div className={styles.cardsContainer}>
      {drivers && drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          id={driver.id}
          driver={driver}
        />
      ))}
    </div>
  );
  };

export default DriverCards;
