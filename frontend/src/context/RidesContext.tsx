import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Ride, Type, SchedulingState } from '../types';
import { useDate } from './date';
import { format_date } from '../util/index';
import axios from '../util/axios';

type ridesState = {
  unscheduledRides: Ride[];
  scheduledRides: Ride[];
  refreshRides: () => Promise<void>;
  refreshRidesByUser: (userId: string, userType: 'rider' | 'driver') => Promise<Ride[]>;
};

const initialState: ridesState = {
  unscheduledRides: [],
  scheduledRides: [],
  refreshRides: async () => {},
  refreshRidesByUser: async () => [],
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

  const refreshRides = useCallback(async () => {
    const formattedDate = format_date(curDate);
    console.log('Refreshing rides for date:', formattedDate);
    try {
      // Fetch rides filtered by the selected date
      const response = await axios.get(`/api/rides?date=${formattedDate}`);
      console.log('Rides API response:', response.data);
      
      const ridesData: Ride[] = response.data.data;
      console.log('All rides from API:', ridesData);
      
      if (ridesData) {
        const unscheduled = ridesData.filter(({ schedulingState }) => schedulingState === SchedulingState.UNSCHEDULED);
        const scheduled = ridesData.filter(({ schedulingState }) => schedulingState === SchedulingState.SCHEDULED);
        
        console.log('Unscheduled rides:', unscheduled);
        console.log('Scheduled rides:', scheduled);
        
        setUnscheduledRides(unscheduled);
        setScheduledRides(scheduled);
      }
    } catch (error) {
      console.error('Error refreshing rides:', error);
    }
  }, [curDate]);

  const refreshRidesByUser = useCallback(async (userId: string, userType: 'rider' | 'driver'): Promise<Ride[]> => {
    console.log(`Refreshing rides for ${userType}:`, userId);
    try {
      // Fetch all rides for the user across all dates
      const queryParam = userType === 'rider' ? 'rider' : 'driver';
      const response = await axios.get(`/api/rides?${queryParam}=${userId}&allDates=true`);
      console.log(`${userType} rides API response:`, response.data);
      
      const ridesData: Ride[] = response.data.data || [];
      console.log(`All ${userType} rides from API:`, ridesData);
      
      return ridesData;
    } catch (error) {
      console.error(`Error refreshing ${userType} rides:`, error);
      return [];
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
        refreshRidesByUser,
      }}
    >
      {children}
    </RidesContext.Provider>
  );
};
