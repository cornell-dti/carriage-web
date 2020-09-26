import React from 'react';
import styles from './card.module.css';
import { Driver, BreakType } from '../../types';
import { clock, phone, wheel } from './icons';

const formatTime = (time: string) => {
  const hours = Number(time.substring(0, 2));
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
  info?: string;
  children?: JSX.Element;
};

const CardInfo = ({ icon, alt, info, children }: CardInfoProps) => (
  <div className={styles.infoContainer}>
    <img className={styles.icon} src={icon} alt={alt} />
    {info ? <p className={styles.info}>{info}</p> : children}
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
  const fullName = `${firstName} ${lastName}`;
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const availability = parseAvailability(startTime, endTime, breaks);

  return (
    <div className={styles.card}>
      <div className={styles.image}>image</div>
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <p className={styles.name}>{fullName}</p>
          <p className={styles.netId}>{netId}</p>
        </div>
        <CardInfo icon={phone} alt="phone icon" info={fmtPhone} />
        <CardInfo icon={clock} alt="clock icon">
          <div className={styles.availabilityContainer}>
            {availability.map(([day, timeRange]) => (
              <p key={day} className={styles.info}>
                <b>{day}:</b> {timeRange}
              </p>
            ))}
          </div>
        </CardInfo>
        <CardInfo icon={wheel} alt="wheel icon" info={vehicle} />
      </div>
    </div>
  );
};

export default Card;
