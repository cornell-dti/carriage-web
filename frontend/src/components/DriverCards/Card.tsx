import React from 'react';
import { Driver, BreakType } from '../../types';

const parseAvailability = (
  startTime: string,
  endTime: string,
  breaks: BreakType,
) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const availability = days.map((day) => {
    let timeRange = '';
    const breakTimes = breaks[day];
    if (!breakTimes) {
      timeRange = `${startTime} - ${endTime}`;
    } else {
      const { breakStart, breakEnd } = breakTimes;
      timeRange = `${startTime} - ${breakStart}, ${breakEnd} - ${endTime}`;
    }
    return [day, timeRange];
  });
  return availability;
};

type CardProps = {
  driver: Driver;
}

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
  const availability = parseAvailability(startTime, endTime, breaks);

  return (
    <div>
      <div>image</div>
      <p>{fullName}</p>
      <p>{netId}</p>
      <p>{phoneNumber}</p>
      {availability.map(([day, timeRange]) => (
        <p key={day}><b>{day}:</b> {timeRange}</p>
      ))}
      <p>{vehicle}</p>
    </div>
  );
};

export default Card;
