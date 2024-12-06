import React, { useState } from 'react';

type WeekState = {
  selectDay: (day: string, index: number) => void;
  deselectDay: (day: string, index: number) => void;
  isDaySelectedByInstance: (day: string, index: number) => boolean;
  getSelectedDays: (index: number) => string[];
};

const initialState: WeekState = {
  selectDay: () => {
    // do nothing
  },
  deselectDay: () => {
    // do nothing
  },
  isDaySelectedByInstance: () => false,
  getSelectedDays: () => [],
};

const WeekContext = React.createContext(initialState);

export const useWeek = () => React.useContext(WeekContext);

type WeekProviderProps = {
  children: React.ReactNode;
};

type WeekType = {
  [day: string]: number[]; // Allow multiple indices for each day
};

export const WeekProvider = ({ children }: WeekProviderProps) => {
  const [week, setWeek] = useState<WeekType>({
    Sun: [],
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
  });

  const selectDay = (day: string, index: number) => {
    setWeek((prev) => ({
      ...prev,
      [day]: [...prev[day], index], // Add index to the day's list
    }));
  };

  const deselectDay = (day: string, index: number) => {
    setWeek((prev) => ({
      ...prev,
      [day]: prev[day].filter((i) => i !== index), // Remove the index from the day's list
    }));
  };

  const isDaySelectedByInstance = (day: string, index: number) => {
    return week[day]?.includes(index);
  };

  const getSelectedDays = (index: number) => {
    return Object.keys(week).filter((day) => week[day].includes(index));
  };

  return (
    <WeekContext.Provider
      value={{
        selectDay,
        deselectDay,
        isDaySelectedByInstance,
        getSelectedDays,
      }}
    >
      {children}
    </WeekContext.Provider>
  );
};
