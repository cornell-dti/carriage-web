import { AvailabilityType } from '../types';

const formatTime = (time: string) => {
    const hours = Number(time.split(':')[0]);
    // set fmtHours to 12 if hours is multiple of 12
    const fmtHours = hours % 12 || 12;
    return `${fmtHours}${hours < 12 ? 'am' : 'pm'}`;
  };
  
export const formatAvailability = (availability?: AvailabilityType) => {
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