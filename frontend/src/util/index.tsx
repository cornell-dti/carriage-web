import moment from 'moment';

export const format_date = (date?: string | Date, format?: string) => {
  const fmt = format ? format : 'YYYY-MM-DD';
  if (date === undefined) {
    return moment().format(fmt);
  }
  return moment(date).format(fmt);
};

/** checkBounds(startDate, time) returns if the selected time
 *  is within the bounds of valid times given by CULift
 */
export const checkBounds = (startDate: string, time: moment.Moment) => {
  const earliest = moment(`${startDate} 07:30`);
  const latest = moment(`${startDate} 22:00`);
  return earliest.isSameOrBefore(time) && latest.isSameOrAfter(time);
};

export const isTimeValid = (startDate: string, pickupTime: string) => {
  const now = moment();
  const today10AM = now.clone().hour(10).minute(0);
  const selectedTime = moment(`${startDate} ${pickupTime}`);
  const bufferDays = now.isAfter(today10AM) ? 2 : 1;
  return selectedTime.isSameOrAfter(now.add(bufferDays, 'day'), 'day');
};

// Re-export user utilities
export { extractNetIdFromEmail, getUserNetId } from './userUtils';
