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
    console.log('Refreshing rides...');
    try {
      // Fetch all rides (not just today's rides) so we can show upcoming rides
      const response = await axios.get(`/api/rides`);
      console.log('Rides API response:', response.data);
      
      const ridesData: Ride[] = response.data.data;
      console.log('All rides from API:', ridesData);
      
      if (ridesData) {
        const unscheduled = ridesData.filter(({ type }) => type === Type.UNSCHEDULED);
        const scheduled = ridesData.filter(({ type }) => type !== Type.UNSCHEDULED);
        
        console.log('Unscheduled rides:', unscheduled);
        console.log('Scheduled rides:', scheduled);
        
        setUnscheduledRides(unscheduled);
        setScheduledRides(scheduled);
      }
    } catch (error) {
      console.error('Error refreshing rides:', error);
    }
  }, []);

  useEffect(() => {
    refreshRides();
  }, [refreshRides]);

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
