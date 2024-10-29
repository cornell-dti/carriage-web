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
    const nonRecurringRidesDataToday: Ride[] = await axios
      .get(`/api/rides?date=${date}`)
      .then((res) => res.data)
      .then((data) => data.data)
      .then((data: Ride[]) => data.filter((ride: Ride) => !ride.recurring));

    let recurringRides: Ride[] = await axios
      .get(`/api/rides?recurring=true`)
      .then((res) => res.data)
      .then((data) => data.data);

    // Here i'm filtering for recurring rides with start and end date including the curDate and includes the day of
    // week of curDate.
    const recurringRidesToday : Ride[] = recurringRides
      .filter((ride) => {
        let endDate = new Date(ride!.endDate!);
        // console.log(ride);
        let startDate = new Date(ride.startTime);
        startDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0
        );
        return (
          curDate >= startDate &&
          curDate <= endDate &&
          ride!.recurringDays?.includes(curDate.getDay())
        );
      })
      //here, i am creating repeating ride objects (that doesn't exist in the database) that link back to some ride in the database. 
      .map((parentRide) => {
        const startTimeRecurringRide = new Date(parentRide.startTime);
        startTimeRecurringRide.setFullYear(curDate.getFullYear());
        startTimeRecurringRide.setMonth(curDate.getMonth());
        startTimeRecurringRide.setDate(curDate.getDate());

        const endTimeRecurringRide = new Date(parentRide.endTime);
        endTimeRecurringRide.setFullYear(curDate.getFullYear());
        endTimeRecurringRide.setMonth(curDate.getMonth());
        endTimeRecurringRide.setDate(curDate.getDate());

        const schedule =
          new Date(parentRide.startTime).getDay() == curDate.getDay() &&
          new Date(parentRide.startTime).getMonth() == curDate.getMonth() &&
          new Date(parentRide.startTime).getFullYear() == curDate.getFullYear()
            ? Type.ACTIVE
            : Type.UNSCHEDULED;
        
        const immediateParentRideId = parentRide.id;
        const sourceRideId = parentRide.sourceRideId;

        const immediateParentRide = recurringRides.find((ride) => ride.id === immediateParentRideId);
        const sourceRide = recurringRides.find((ride) => ride.id === sourceRideId);


        return {
          ...parentRide,
          startTime: startTimeRecurringRide.toISOString(),
          endTime: endTimeRecurringRide.toISOString(),
          type: schedule,
          immediateParentRideId: immediateParentRideId,
          sourceRideId : sourceRideId,
          immediateParentRide,
          sourceRide,
          id: '',
        };
      });

    console.log('current date is ', curDate.getDate());
    // const ridesDataTodayNoParentRec = ridesDataToday.filter((ride : Ride) => !(ride.recurring && ride.parentRide === undefined));
    const combinedRidesData =
      nonRecurringRidesDataToday.concat(recurringRidesToday);
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
