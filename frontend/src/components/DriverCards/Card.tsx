import React from 'react';
import { Driver, BreakType } from '../../types';

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
