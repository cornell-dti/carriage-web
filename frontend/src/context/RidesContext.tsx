import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Ride, Type } from '../types';
import { useReq } from './req';
import { useDate } from './date';
import { format_date } from '../util/index';

type ridesState = {
  unscheduledRides: Ride[];
  activeRides: Ride[];
  pastRides: Ride[];
  refreshRides: () => Promise<void>;
};

const initialState: ridesState = {
  unscheduledRides: [],
  activeRides: [],
  pastRides: [],
  refreshRides: async () => {},
};

const RidesContext = React.createContext(initialState);
export const useRides = () => React.useContext(RidesContext);

type RidesProviderProps = {
  children: React.ReactNode;
};

export const RidesProvider = ({ children }: RidesProviderProps) => {
  const [unscheduledRides, setUnscheduledRides] = useState<Ride[]>([]);
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();
  const { curDate } = useDate();
  const date = format_date(curDate);

  const filterRides = (rides: Ride[], rideType: Type) => {
    return rides.filter((ride) => ride.type === rideType);
  };

  const refreshRides = useCallback(async () => {
    const ridesData: Ride[] = await fetch(
      `/api/rides?date=${date}`,
      withDefaults()
    )
      .then((res) => res.json())
      .then((data) => data.data);
    if (ridesData) {
      setUnscheduledRides(filterRides(ridesData, Type.UNSCHEDULED));
      setActiveRides(filterRides(ridesData, Type.ACTIVE));
      setPastRides(filterRides(ridesData, Type.PAST));
    }
  }, [withDefaults, date]);

  useEffect(() => {
    refreshRides();
  }, [date]);

  return (
    <RidesContext.Provider
      value={{
        unscheduledRides,
        activeRides,
        pastRides,
        refreshRides,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
