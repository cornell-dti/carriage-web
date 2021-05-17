import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Ride } from '../../types/index';
import RiderRidesTable from './RiderRidesTable';
import styles from './table.module.css';
import { useReq } from '../../context/req';
import { useDate } from '../../context/date';

type RiderScheduleTableProp = {
  riderId: string;
  isPast: boolean; // true if past rides, false if upcoming rides
};

const RiderScheduleTable = ({ riderId, isPast }: RiderScheduleTableProp) => {
  const { curDate } = useDate();
  const [rideMapArray, setRideMapArray] = useState<any[]>([]);
  const { withDefaults } = useReq();

  // sort rides from newest to oldest
  const compRides = (a: Ride, b: Ride) => {
    const x = new Date(a.startTime);
    const y = new Date(b.startTime);
    if (x < y) return 1;
    if (x > y) return -1;
    return 0;
  };

  // removes rides whose startTime is past the current time
  const filterRides = (ride: Ride): boolean => {
    const rideDate = new Date(ride.startTime);
    if (isPast)
      return rideDate <= curDate;
    else
      return rideDate >= curDate;
  };

  // Source is from Helen's code on carriage-rider: 
  // https://github.com/cornell-dti/carriage-rider/blob/master/lib/utils/RecurringRidesGenerator.dart
  // Returns the number of days between [start] and the next day that falls on [weekday].
  // The weekday numbering follows Flutter's convention where 1 to 7 are Monday to Sunday.
  // If [start] falls on [weekday], returns 7.
  const daysUntilWeekday = (start: Date, weekday: number): number => {
    const startWeekday = start.getDay();
    if (weekday < startWeekday) {
      weekday += 7;
    }
    const days = weekday - startWeekday;
    if (days == 0) {
      return 7;
    }
    return days;
  };

  // returns a list of dummy recurring rides
  const generateRecurringRides = (rides: Ride[]): Ride[] => {
    let recurringRides: Ride[] = [];
    rides.forEach(originalRide => {
      const origEndDate = new Date(originalRide.endDate!);
      // create dummy rides only for active recurring rides
      if (originalRide.recurring || origEndDate >= curDate) {
        const origStartTime = new Date(originalRide.startTime);
        let rideStart = origStartTime;
        const days = originalRide.recurringDays!;
        let dayIndex = days.indexOf(rideStart.getDay());
        while (rideStart <= origEndDate) {
          // find the next occurrence
          dayIndex = dayIndex == days.length - 1 ? 0 : dayIndex + 1;
          const daysUntilNextOccurrence = daysUntilWeekday(rideStart, days[dayIndex]);
          rideStart.setDate(rideStart.getDate() + daysUntilNextOccurrence);

          // add to list if ride's start date is not in list of deleted dates
          if (!originalRide.deleted?.includes(rideStart.toUTCString())) {
            const rideInstance: Ride = {
              id: originalRide.id,
              type: 'unscheduled',
              status: 'not_started',
              startLocation: originalRide.startLocation,
              endLocation: originalRide.endLocation,
              startTime: rideStart.toUTCString(),
              endTime: originalRide.endTime,
              rider: originalRide.rider,
              driver: originalRide.driver,
              recurring: true,
              recurringDays: originalRide.recurringDays,
              endDate: originalRide.endDate
            };
            recurringRides.push(rideInstance);
          };
        };
      };
    });
    return recurringRides;
  };

  useEffect(() => {
    fetch(`/api/rides?rider=${riderId}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        const allRides = generateRecurringRides(data).concat(data);
        allRides.filter(filterRides).sort(compRides);
        rideMapToArray(getRideMap(allRides));
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withDefaults, curDate]);

  // returns date in the format "MM/DD/YYYY"
  const formatDate = (date: string): string => {
    return moment(date).format('MM/DD/YYYY');
  };

  // returns a map with date as keys and a list of rides as values
  const getRideMap = (rides: Ride[]): Map<string, Ride[]> => {
    const rideMap = new Map();
    rides.forEach((ride) => {
      const rideDate = formatDate(ride.startTime);
      const rideArray: Ride[] | undefined = rideMap.get(rideDate);
      if (rideArray) { // push ride onto rideArray
        rideArray.push(ride);
        rideMap.set(rideDate, rideArray);
      } else { // create new array
        rideMap.set(rideDate, [ride]);
      }
    });
    return rideMap;
  };

  // transforms the rides map into an array
  const rideMapToArray = (rideMap: Map<string, Ride[]>) => {
    const dateArray = Array.from(rideMap.keys());
    const rideArray = Array.from(rideMap.values());
    if (dateArray.length === rideArray.length) {
      // Each element of newRideMapArray is a tuple of type (string, Ride[])
      const newRideMapArray: any[] = [];
      for (let i = 0; i < dateArray.length; i += 1) {
        const pair = [dateArray[i], rideArray[i]];
        newRideMapArray.push(pair);
      }
      setRideMapArray(newRideMapArray);
    } else {
      console.log('Error: Sizes of date and ride arrays are not equal. \
                    This error should be impossible.');
    }
  };

  const getWeekday = (time: string): string => {
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    console.log('getWeekday!');
    return weekdays[new Date(time).getDay()];
  };

  const renderRides = (): JSX.Element[] => (
    rideMapArray.map(([date, rideArray]: [string, Ride[]], index: number) => (
      <>
        {rideArray.length > 0 &&
        <>
          <h1 className={styles.formHeader}>
            {date}
            <span className={styles.gray}>
               - {getWeekday(rideArray[0].startTime)}
            </span>
          </h1>
          <RiderRidesTable rides={rideArray} />
        </>}
      </>
    ))
  );

  return (
    <>
      {renderRides()}
    </>
  );
};

export default RiderScheduleTable;
