import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Ride, Type } from '../types';
import { useReq } from './req';
import { useDate } from './date';
import { format_date } from '../util/index';

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
  const { withDefaults } = useReq();
  const { curDate } = useDate();
  const date = format_date(curDate);

  const refreshRides = useCallback(async () => {
    const ridesData: Ride[] = await fetch(
      `/api/rides?date=${date}`,
      withDefaults()
    )
      .then((res) => res.json())
      .then((data) => data.data);
    if (ridesData) {
      setUnscheduledRides(
        ridesData.filter(({ type }) => type === Type.UNSCHEDULED)
      );
      setScheduledRides(
        ridesData.filter(({ type }) => type !== Type.UNSCHEDULED)
      );
    }
  }, [withDefaults, date]);

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
