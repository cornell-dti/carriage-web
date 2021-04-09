type TableData = {
  year: string
  monthday: string
  dayCount: number,
  dayNoShows: number,
  dayCancels: number,
  nightCount: number,
  nightNoShows: number,
  nightCancels: number,
  dailyTotal: number,
  drivers: {
    [name: string]: number
  }
}

const generate = () : TableData[] => {
  const data = [...new Array(10)];
  return data.map((_, i) => ({
    year: '2021',
    monthday: `${Number('0406') + i}`.padStart(4, '0'),
    dayCount: 20 + i,
    dayNoShows: 2,
    dayCancels: 4,
    nightCount: 5,
    nightNoShows: 0,
    nightCancels: 1,
    drivers: {
      'Helen Yang': 3,
      'Matthew Guo': 4,
      'Michael Ye': 5,
      'Tony Yang': 6,
      'Laura Sizemore': 7,
    },
    dailyTotal: 20 + i + 5,
  }));
};

export default {
  data: generate(),
};
