import React, {
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import { Ride, Type, Rider } from '../types';
import { useReq } from './req';
import { useDate } from './date';
import { format_date } from '../util/index';
import AuthContext from '../context/auth';

type ridesState = {
  unscheduledRides: Ride[];
  scheduledRides: Ride[];
  upcomingRides: Ride[];
  pastRides: Ride[];
  refreshRides: () => Promise<void>;
};

const initialState: ridesState = {
  unscheduledRides: [],
  scheduledRides: [],
  upcomingRides: [],
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
  const [scheduledRides, setScheduledRides] = useState<Ride[]>([]);
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [pastRides, setPastRides] = useState<Ride[]>([]);
  const { withDefaults } = useReq();
  const { curDate } = useDate();
  const date = format_date(curDate);
  const { id, user } = useContext(AuthContext);

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
    const userRides: Ride[] = await fetch(
      `/api/rides?rider=${id}`,
      withDefaults()
    )
      .then((res) => res.json())
      .then((data) => data.data);
    if (userRides) {
      setPastRides(userRides.filter(({ type }) => type === Type.PAST));
      setUpcomingRides(userRides.filter(({ type }) => type !== Type.PAST));
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
        upcomingRides,
        pastRides,
        refreshRides,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
