import React from 'react';
import { Driver, BreakType } from '../../types/index';

const parseAvailability = (
  startTime: string,
  endTime: string,
  breaks: BreakType,
) => {
  const availability = Object.entries(breaks).map(([day, breakTimes]) => {
    let timeRange = '';
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

const Card = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  startTime,
  endTime,
  breaks,
  vehicle,
}: Driver) => {
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
        <p><b>{day}:</b> {timeRange}</p>
      ))}
      <p>{vehicle}</p>
    </div>
  );
};

export default Card;
