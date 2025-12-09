import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { ObjectType } from '../../types/index';
import { RideType } from '@carriage-web/shared/src/types/ride';
import RiderRidesTable from './RiderRidesTable';
import styles from './table.module.css';
import { useDate } from '../../context/date';

type RiderScheduleTableProp = {
  data: RideType[];
  isPast: boolean; // true if past rides, false if upcoming rides
};

const RiderScheduleTable = ({ data, isPast }: RiderScheduleTableProp) => {
  const { curDate } = useDate();
  const [rideMapArray, setRideMapArray] = useState<any[]>([]);

  // sort rides from newest to oldest
  const compRides = useCallback(
    (a: RideType, b: RideType) => {
      const x = new Date(a.startTime);
      const y = new Date(b.startTime);
      if (x < y) return isPast ? 1 : -1;
      if (x > y) return isPast ? -1 : 1;
      return 0;
    },
    [isPast]
  );

  // removes rides whose startTime is past the current time
  const filterRides = useCallback(
    (ride: RideType): boolean => {
      if (isPast) return ride.type === 'past';
      return ride.type !== 'past';
    },
    [isPast]
  );

  // Source is from Helen's code on carriage-rider:
  // https://github.com/cornell-dti/carriage-rider/blob/master/lib/utils/RecurringRidesGenerator.dart
  // Returns the number of days between [start] and the next day that falls on [weekday].
  // The weekday numbering follows Flutter's convention where 1 to 7 are Monday to Sunday.
  // If [start] falls on [weekday], returns 7.
  const daysUntilWeekday = (start: moment.Moment, weekday: number): number => {
    const startWeekday = start.day();
    let endWeekday = weekday;
    if (weekday < startWeekday) {
      endWeekday += 7;
    }
    const days = endWeekday - startWeekday;
    return days || 7;
  };

  // returns a list of dummy recurring rides
  const generateRecurringRides = useCallback(
    (rides: RideType[]): RideType[] => {
      // Recurring ride expansion is disabled for now
      // Return original rides unchanged since we're focusing on single rides
      return rides;
    },
    [curDate]
  );

  // returns a map with date as keys and a list of rides as values
  const getRideMap = useCallback((rides: RideType[]): ObjectType => {
    const rideMap: ObjectType = {};
    rides.forEach((ride) => {
      const rideDate = formatDate(ride.startTime);
      const rideArray: RideType[] | undefined = rideMap[rideDate];
      if (rideArray) {
        // push ride onto rideArray
        rideArray.push(ride);
        rideMap[rideDate] = rideArray;
      } else {
        // create new array
        rideMap[rideDate] = [ride];
      }
    });
    return rideMap;
  }, []);

  useEffect(() => {
    let allRides = generateRecurringRides(data).concat(data);
    allRides = allRides.filter(filterRides).sort(compRides);
    rideMapToArray(getRideMap(allRides));
  }, [compRides, data, filterRides, generateRecurringRides, getRideMap]);

  // returns date in the format "MM/DD/YYYY"
  const formatDate = (date: string): string =>
    moment(date).format('MM/DD/YYYY');

  // transforms the rides map into an array
  const rideMapToArray = (rideMap: ObjectType) => {
    const dateArray = Object.keys(rideMap);
    const rideArray = Object.values(rideMap);
    if (dateArray.length === rideArray.length) {
      // Each element of newRideMapArray is a tuple of type (string, Ride[])
      const newRideMapArray: any[] = [];
      for (let i = 0; i < dateArray.length; i += 1) {
        const pair = [dateArray[i], rideArray[i]];
        newRideMapArray.push(pair);
      }
      setRideMapArray(newRideMapArray);
    } else {
      console.log(
        'Error: Sizes of date and ride arrays are not equal. This error should be impossible.'
      );
    }
  };

  const getWeekday = (time: string): string => {
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return weekdays[new Date(time).getDay()];
  };

  return (
    <div className={styles.scheduleTable}>
      <div className={styles.scheduleTableInner}>
        {rideMapArray.map(
          ([date, rideArray]) =>
            rideArray.length > 0 && (
              <React.Fragment key={date}>
                <h1 className={styles.formHeader}>
                  {date}
                  <span className={styles.gray}>
                    - {getWeekday(rideArray[0].startTime)}
                  </span>
                </h1>
                <RiderRidesTable rides={rideArray} isPast={isPast} />
              </React.Fragment>
            )
        )}
      </div>
    </div>
  );
};

export default RiderScheduleTable;
