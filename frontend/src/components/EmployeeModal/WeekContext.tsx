import React, { useState, useCallback } from 'react';

type WeekState = {
  selectDay: (day: string, index: number) => void;
  deselectDay: (day: string) => void;
  isDayOpen: (day: string) => boolean;
  isDaySelectedByInstance: (day: string, index: number) => boolean;
  getSelectedDays: (index: number) => string[];
};

const initialState: WeekState = {
  selectDay: () => {},
  deselectDay: () => {},
  isDayOpen: () => false,
  isDaySelectedByInstance: () => false,
  getSelectedDays: () => [],
};

const WeekContext = React.createContext(initialState);

export const useWeek = () => React.useContext(WeekContext);

type WeekProviderProps = {
  children: React.ReactNode;
};

type WeekType = {
  [day: string]: number;
};

export const WeekProvider = ({ children }: WeekProviderProps) => {
  const [week, setWeek] = useState<WeekType>({
    Sun: -1,
    Mon: -1,
    Tue: -1,
    Wed: -1,
    Thu: -1,
    Fri: -1,
    Sat: -1,
  });

  const setDay = useCallback((day: string, value: number) => {
    setWeek((prev) => {
      if (prev[day] === value) return prev;
      return { ...prev, [day]: value };
    });
  }, []);

  const selectDay = useCallback(
    (day: string, index: number) => setDay(day, index),
    [setDay]
  );

  const deselectDay = useCallback((day: string) => setDay(day, -1), [setDay]);

  const isDayOpen = useCallback((day: string) => week[day] === -1, [week]);

  const isDaySelectedByInstance = useCallback(
    (day: string, index: number) => week[day] === index,
    [week]
  );

  const getSelectedDays = useCallback(
    (index: number) => Object.keys(week).filter((day) => week[day] === index),
    [week]
  );

  return (
    <WeekContext.Provider
      value={{
        selectDay,
        deselectDay,
        isDayOpen,
        isDaySelectedByInstance,
        getSelectedDays,
      }}
    >
      {children}
    </WeekContext.Provider>
  );
};
