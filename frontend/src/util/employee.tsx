import { AvailabilityType } from '../types';

const formatTime = (time: string) => {
  const colon = time.indexOf(':');
  let hours = parseInt(time.slice(0, colon));
  const pm = hours >= 12;

  if (hours % 12 == 0) {
    hours = 12;
  } else {
    hours = hours % 12;
  }

  const minutes = time.slice(colon + 1);
  const t = pm ? `${hours}:${minutes}pm` : `${hours}:${minutes}am`;
  return t;
};

const formatAvailability = (availability?: AvailabilityType) => {
  if (!availability) return null;
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

export default formatAvailability;
