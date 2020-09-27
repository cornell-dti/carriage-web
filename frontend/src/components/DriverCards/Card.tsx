import React, { useEffect, useState } from 'react';
import styles from './card.module.css';
import { Driver, BreakType } from '../../types';
import { capacity, clock, phone, wheel } from './icons';

const formatTime = (time: string) => {
  const hours = Number(time.split(':')[0]);
  // set fmtHours to 12 if hours is multiple of 12
  const fmtHours = hours % 12 || 12;
  return `${fmtHours}${hours < 12 ? 'am' : 'pm'}`;
};

const parseAvailability = (
  startTime: string,
  endTime: string,
  breaks: BreakType,
) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const availability = days.map((day) => {
    let timeRange = '';
    const breakTimes = breaks[day];
    const fmtStart = formatTime(startTime);
    const fmtEnd = formatTime(endTime);
    if (!breakTimes) {
      timeRange = `${fmtStart}-${fmtEnd}`;
    } else {
      const { breakStart, breakEnd } = breakTimes;
      const fmtBreakStart = formatTime(breakStart);
      const fmtBreakEnd = formatTime(breakEnd);
      timeRange = `${fmtStart}-${fmtBreakStart}, ${fmtBreakEnd}-${fmtEnd}`;
    }
    return [day, timeRange];
  });
  return availability;
};

const formatPhone = (phoneNumber: string) => {
  const areaCode = phoneNumber.substring(0, 3);
  const firstPart = phoneNumber.substring(3, 6);
  const secondPart = phoneNumber.substring(6, 10);
  return `${areaCode}-${firstPart}-${secondPart}`;
};

type CardInfoProps = {
  icon: string;
  alt: string;
  children: JSX.Element | JSX.Element[];
};

const CardInfo = ({ icon, alt, children }: CardInfoProps) => (
  <div className={styles.infoContainer}>
    <img className={styles.icon} src={icon} alt={alt} />
    {children}
  </div>
);

type CardProps = {
  driver: Driver;
};

const Card = ({
  driver: {
    firstName,
    lastName,
    email,
    phoneNumber,
    startTime,
    endTime,
    breaks,
    vehicle,
  },
}: CardProps) => {
  const fullName = firstName.length + lastName.length > 16
    ? `${firstName} ${lastName[0]}.`
    : `${firstName} ${lastName}`;
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const availability = parseAvailability(startTime, endTime, breaks);
  const [vehicleInfo, setVehicleInfo] = useState({ name: '', capacity: '' });

  useEffect(() => {
    fetch(`/vehicles/${vehicle}`)
      .then((res) => res.json())
      .then((data) => setVehicleInfo(data));
  }, [vehicle]);

  return (
    <div className={styles.card}>
      <div className={styles.image}></div>
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <p className={styles.name}>{fullName}</p>
          <p className={styles.netId}>{netId}</p>
        </div>
        <CardInfo icon={phone} alt="phone icon">
          <p className={styles.info}>{fmtPhone}</p>
        </CardInfo>
        <CardInfo icon={clock} alt="clock icon">
          <div>
            {availability.map(([day, timeRange]) => (
              <p key={day} className={styles.info}>
                <b>{day}:</b> {timeRange}
              </p>
            ))}
          </div>
        </CardInfo>
        <CardInfo icon={wheel} alt="wheel icon">
          <p className={styles.info}>
            {`${vehicleInfo.name} | ${vehicleInfo.capacity}`}
          </p>
          <img src={capacity} alt="capacity icon" style={{ marginLeft: '2px' }} />
        </CardInfo>
      </div>
    </div>
  );
};

export default Card;
