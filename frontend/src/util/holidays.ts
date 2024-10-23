// Update this file with API fetch later on, i.e once per AY release or somet
export enum Holidays {
  MartinLutherKingJrDay = 'MartinLutherKingJrDay: 2024-01-15 to 2024-01-15',
  MemorialDay = 'MemorialDay: 2024-05-27 to 2024-05-27',
  Juneteenth = 'Juneteenth: 2024-06-19 to 2024-06-19',
  IndependenceDay = 'IndependenceDay: 2024-07-04 to 2024-07-04',
  LaborDay = 'LaborDay: 2024-09-02 to 2024-09-02',
  Thanksgiving = 'Thanksgiving: 2024-11-28 to 2024-12-2',
  WinterBreak = 'WinterBreak: 2024-12-23 to 2025-01-01',
  FallBreak = 'FallBreak: 2024-10-12 to 2024-10-13',
  IndigenousPeoplesDay = 'IndigenousPeoplesDay: 2024-10-14 to 2024-10-14',
  VeteransDay = 'VeteransDay: 2024-11-11 to 2024-11-11',
  FebruaryBreak = 'FebruaryBreak: 2025-02-24 to 2025-02-25',
}

type holiday = {
  name: string;
  startDate: Date;
  endDate: Date;
};

function parseHoliday(holiday: Holidays): holiday {
  const [name, dates] = holiday.split(': ');
  const [start, end] = dates.split(' to ');

  return { name, startDate: new Date(start), endDate: new Date(end) };
}

export const holidaysList: holiday[] = Object.values(Holidays).map((h) =>
  parseHoliday(h)
);
