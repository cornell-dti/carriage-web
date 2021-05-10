import React, { useState, useEffect } from 'react';
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

  const filterRides = (ride: Ride): boolean => {
    const rideDate = new Date(ride.startTime);
    if (isPast)
      return rideDate <= curDate;
    else
      return rideDate >= curDate;
  };

  useEffect(() => {
    // fetch(`/api/rides?type=unscheduled`, withDefaults())
    fetch(`/api/rides?rider=${riderId}`, withDefaults())
      .then((res) => res.json())
      .then(({ data }) => {
        rideMapToArray(getRideMap(data.filter(filterRides).sort(compRides)));
      })
  }, [withDefaults, curDate]);

  const formatDate = (date: string): string => {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) 
      month = '0' + month;
    if (day.length < 2) 
      day = '0' + day;
    return [month, day, year].join('/');
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

  const rideList = (): JSX.Element[] => (
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

  const renderRides = (): JSX.Element => (
    <>
      {rideMapArray ? rideList() : null}
    </>
  );

  return (
    <>
      {renderRides()}
    </>
  );
};

export default RiderScheduleTable;
