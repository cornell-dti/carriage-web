/**
 * @file holidays.ts [WIP]
 * @description This file contains an enumeration of test holidays along with
 * their corresponding date ranges for the 2024-2025 academic year. Each holiday is
 * represented with a start and end date for easy lookups. Future plans  [WIP] involve fetching
 * holiday data from an external API, ideally updating this file once per academic year release.
 */

/**
 * @enum Holidays
 * @description An enumeration of holidays observed within the academic year. Each holiday
 * is represented as a string with its name and date range in the format:
 * "HolidayName: startDate to endDate".
 */
export enum Holidays {
  MartinLutherKingJrDay = 'MartinLutherKingJrDay: 2024-01-15 to 2024-01-15',
  MemorialDay = 'MemorialDay: 2024-05-27 to 2024-05-27',
  Juneteenth = 'Juneteenth: 2024-06-19 to 2024-06-19',
  IndependenceDay = 'IndependenceDay: 2024-07-04 to 2024-07-04',
  LaborDay = 'LaborDay: 2024-09-02 to 2024-09-02',
  Thanksgiving = 'Thanksgiving: 2024-11-28 to 2024-12-02',
  WinterBreak = 'WinterBreak: 2024-12-23 to 2025-01-01',
  FallBreak = 'FallBreak: 2024-10-12 to 2024-10-13',
  IndigenousPeoplesDay = 'IndigenousPeoplesDay: 2024-10-14 to 2024-10-14',
  VeteransDay = 'VeteransDay: 2024-11-11 to 2024-11-11',
  FebruaryBreak = 'FebruaryBreak: 2025-02-24 to 2025-02-25',
}

/**
 * @typedef holiday
 * @type {Object}
 * @property {string} name - The name of the holiday.
 * @property {Date} startDate - The start date of the holiday period.
 * @property {Date} endDate - The end date of the holiday period.
 */
type holiday = {
  name: string;
  startDate: Date;
  endDate: Date;
};

/**
 * @function parseHoliday
 * @description Parses a holiday string from the Holidays enum into a holiday object.
 * @param {Holidays} holiday - The holiday enum value containing name and date range.
 * @returns {holiday} An object representing the parsed holiday with name, start date, and end date.
 */
function parseHoliday(holiday: Holidays): holiday {
  const [name, dates] = holiday.split(': ');
  const [start, end] = dates.split(' to ');
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T23:59:59`);
  return { name, startDate, endDate };
}

/**
 * @constant {holiday[]} holidaysList
 * @description An array of holiday objects representing each holiday in the Holidays enum.
 * Each holiday includes a name, start date, and end date for easy reference.
 */
export const holidaysList: holiday[] = Object.values(Holidays).map((h) =>
  parseHoliday(h)
);

export const isHoliday = (date: Date) => {
  return holidaysList.some((holiday) => {
    return holiday.startDate <= date && holiday.endDate >= date;
  });
};
