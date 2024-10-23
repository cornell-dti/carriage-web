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
    const ridesDataToday: Ride[] = await axios
      .get(`/api/rides?date=${date}`)
      .then((res) => res.data)
      .then((data) => data.data)
      .then((data : Ride[]) => data.filter((ride : Ride) => !(ride.recurring && ride.parentRide === undefined)));

    const newRecurringRides: Ride[] = await axios
      .get(`/api/rides?recurring=true`)
      .then((res) => res.data)
      .then((data) => data.data)
      // here, I'm assuming  that all rides with parentRide as undefined is the "source" rides, meaning that all recurring rides have these rides as parents.
      .then((data: Ride[]) =>
        data.filter((ride) => ride.parentRide === undefined)
      )
      .then((data: Ride[]) =>
        data.filter((ride) => {
          let endDate = new Date(ride!.endDate!);
          console.log(ride);
          let startDate = new Date(ride.startTime);
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
          let deletedDateList = ride.deleted === undefined ? [] : ride.deleted.map((d) => new Date(d));
          let editedDateList = ride.edits === undefined ? [] : ride.edits.map((d) => new Date(d));
          console.log(deletedDateList);
          return (
            curDate >= startDate && 
            curDate <= endDate &&
            ride!.recurringDays?.includes(curDate.getDay()) &&
            !deletedDateList.some((d) => d.getDate() === curDate.getDate() && d.getMonth() === curDate.getMonth() && d.getFullYear() === curDate.getFullYear()) &&
            !editedDateList.some((d) => d.getDate() === curDate.getDate() && d.getMonth() === curDate.getMonth() && d.getFullYear() === curDate.getFullYear())
          );
        })
      )
      .then((recurringParentRides: Ride[]) =>
        recurringParentRides.map((parentRide) => {
          const startTimeRecurringRide = new Date(parentRide.startTime);
          startTimeRecurringRide.setFullYear(curDate.getFullYear());
          startTimeRecurringRide.setMonth(curDate.getMonth());
          startTimeRecurringRide.setDate(curDate.getDate());

          const endTimeRecurringRide = new Date(parentRide.endTime);
          endTimeRecurringRide.setFullYear(curDate.getFullYear());
          endTimeRecurringRide.setMonth(curDate.getMonth());
          endTimeRecurringRide.setDate(curDate.getDate());

          console.log('end time recurring ride is ', endTimeRecurringRide);
          console.log(
            'end time iso recurring ride is ',
            endTimeRecurringRide.toISOString()
          );
          console.log('end time parent', parentRide.endTime);

          // console.log("parent end time", new Date(parentRide.endTime))
          return {
            ...parentRide,
            startTime: startTimeRecurringRide.toISOString(),
            endTime: endTimeRecurringRide.toISOString(),
            type: Type.UNSCHEDULED,
            parentRide: parentRide,
            id : ""
          };
        })
      );

    console.log('current date is ', curDate.getDate());
    // const ridesDataTodayNoParentRec = ridesDataToday.filter((ride : Ride) => !(ride.recurring && ride.parentRide === undefined));
    const combinedRidesData = ridesDataToday.concat(newRecurringRides);
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
