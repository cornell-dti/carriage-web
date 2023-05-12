import React, { useCallback, useState, useRef, useEffect } from 'react';
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
    const ridesData: Ride[] = await axios
      .get(`/api/rides?date=${date}`)
      .then((res) => res.data)
      .then((data) => data.data);
    if (ridesData) {
      setUnscheduledRides(
        ridesData.filter(({ type }) => type === Type.UNSCHEDULED)
      );
      setScheduledRides(
        ridesData.filter(({ type }) => type !== Type.UNSCHEDULED)
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
