import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';
import { Ride, Type } from '../types';
import { useDate } from './date';
import { format_date } from '../util/index';
import axios from '../util/axios';
import { start } from 'repl';

type ridesState = {
  unscheduledRides: Ride[];
  scheduledRides: Ride[];
  refreshRides: () => Promise<void>;
};

const initialState: ridesState = {
  unscheduledRides: [],
  scheduledRides: [],
  refreshRides: async () => {},
};

const RidesContext = React.createContext(initialState);
export const useRides = () => React.useContext(RidesContext);

type RidesProviderProps = {
  children: React.ReactNode;
};



export const RidesProvider = ({ children }: RidesProviderProps) => {
  const [unscheduledRides, setUnscheduledRides] = useState<Ride[]>([]);
  const [scheduledRides, setScheduledRides] = useState<Ride[]>([]);
  const { curDate } = useDate();
  const date = format_date(curDate);

  const refreshRides = useCallback(async () => {
    const nonRecurringRidesDataToday: Ride[] = await axios
      .get(`/api/rides?date=${date}`)
      .then((res) => res.data)
      .then((data) => data.data)
      .then((data: Ride[]) => data.filter((ride: Ride) => !ride.recurring));

    let recurringRides: Ride[] = await axios
      .get(`/api/rides/recurring`)
      .then((res) => res.data)
      .then((data) => data.data);

    for (let ride of recurringRides) {
      ride.parentRide = recurringRides.find((rideTmp) => rideTmp.id === ride.parentRideId);
      ride.childRide = recurringRides.find((rideTmp) => rideTmp.id === ride.childRideId);
      ride.sourceRide = ride;

    }

    // Here i'm filtering for recurring rides with start and end date including the curDate and includes the day of
    // week of curDate.
    console.log("recurring rides are ", recurringRides);
    const recurringRidesToday : Ride[] = recurringRides
      .filter((ride) => {
        
        let endDate = new Date(ride!.endDate!);
        let [year, month, date] = (ride!.endDate!).split('-');
        endDate.setFullYear(Number(year), Number(month) - 1, Number(date));
        endDate.setHours(0, 0, 0);
        console.log(`The current date is ${curDate}. This repeating ride end date is ${endDate}`);
        
        let startDate = new Date(ride.startTime);
        startDate.setHours(0, 0, 0);

        let curDateZeroedHours = (new Date(curDate.getTime()));
        curDateZeroedHours.setHours(0, 0, 0);

        console.log(`
          The current date is ${curDate}. 
          This repeating ride end date is ${curDateZeroedHours}. 
          This repeating ride start date is ${startDate}`
        );


        return (
          curDateZeroedHours >= startDate &&
          curDateZeroedHours <= endDate &&
          ride!.recurringDays?.includes(curDate.getDay())
        );
      })
      //here, i am creating repeating ride objects (that doesn't exist in the database) that link back to some ride in the database. 
      .map((filteredSourceRide) => {
        const startTimeRecurringRide = new Date(filteredSourceRide.startTime);
        startTimeRecurringRide.setFullYear(curDate.getFullYear());
        startTimeRecurringRide.setMonth(curDate.getMonth());
        startTimeRecurringRide.setDate(curDate.getDate());
        const endTimeRecurringRide = new Date(filteredSourceRide.endTime);
        endTimeRecurringRide.setFullYear(curDate.getFullYear());
        endTimeRecurringRide.setMonth(curDate.getMonth());
        endTimeRecurringRide.setDate(curDate.getDate());

        const schedule =
          new Date(filteredSourceRide.startTime).getDate() == curDate.getDate() &&
          new Date(filteredSourceRide.startTime).getMonth() == curDate.getMonth() &&
          new Date(filteredSourceRide.startTime).getFullYear() == curDate.getFullYear()
            ? Type.ACTIVE
            : Type.UNSCHEDULED;

        return {
          ...filteredSourceRide, // id should be the same as the sourceRide 
          startTime: startTimeRecurringRide.toISOString(),
          endTime: endTimeRecurringRide.toISOString(),
          type: schedule,
          sourceRide : filteredSourceRide
        };
      });

    const combinedRidesData =
      nonRecurringRidesDataToday.concat(recurringRidesToday);

    console.log(combinedRidesData);
    if (combinedRidesData) {
      setUnscheduledRides(
        combinedRidesData.filter(({ type }) => type === Type.UNSCHEDULED)
      );
      setScheduledRides(
        combinedRidesData.filter(({ type }) => type !== Type.UNSCHEDULED)
      );
    }
  }, [date]);

  useEffect(() => {
    refreshRides();
  }, [date]);

  return (
    <RidesContext.Provider
      value={{
        unscheduledRides,
        scheduledRides,
        refreshRides,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
