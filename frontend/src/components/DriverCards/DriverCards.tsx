import React, { useEffect, useState } from 'react';
import Card, { CardInfo } from '../Card/Card';
import styles from './drivercards.module.css';
import { capacity, clock, phone, wheel } from './icons';
import { Driver, BreakType, Vehicle } from '../../types';
import { Link } from 'react-router-dom';

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

type DriverCardProps = {
  driver: Driver;
}

const DriverCard = ({
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
}: DriverCardProps) => {
  const netId = email.split('@')[0];
  const fmtPhone = formatPhone(phoneNumber);
  const availability = parseAvailability(startTime, endTime, breaks);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle>();
  const fullName = firstName + "_" + lastName;
  const userInfo = {
    firstName: firstName, lastName: lastName, netId: netId, phone: fmtPhone,
    availability: availability, vehicle: vehicleInfo
  }

  useEffect(() => {
    fetch(`/vehicles/${vehicle}`)
      .then((res) => res.json())
      .then((data) => setVehicleInfo(data));
  }, [vehicle]);

  return (
    <>
      <Link to={{ pathname: "/drivers/driver", state: userInfo, search: `?name=${fullName}` }}
        style={{ textDecoration: 'none', color: "inherit" }}>
        <Card firstName={firstName} lastName={lastName} netId={netId} >
          <CardInfo icon={phone} alt="phone icon">
            <p>{fmtPhone}</p>
          </CardInfo>
          <CardInfo icon={clock} alt="clock icon">
            <div>
              {availability.map(([day, timeRange]) => (
                <p key={day}><b>{day}:</b> {timeRange}</p>
              ))}
            </div>
          </CardInfo>
          <CardInfo icon={wheel} alt="wheel icon">
            <p>{vehicleInfo && `${vehicleInfo.name} | ${vehicleInfo.capacity}`}</p>
            <img src={capacity} alt="capacity icon" style={{ marginLeft: '2px' }} />
          </CardInfo>
        </Card>
      </Link>
    </>
  );
};

const DriverCards = () => {
  const [drivers, setDrivers] = useState<Driver[]>();

  useEffect(() => {
    fetch('/drivers')
      .then((res) => res.json())
      .then(({ data }) => setDrivers(data));
  }, []);

  return (
    <div className={styles.cardsContainer}>
      {drivers && drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
        />
      ))}
    </div>
  );
};

export default DriverCards;
