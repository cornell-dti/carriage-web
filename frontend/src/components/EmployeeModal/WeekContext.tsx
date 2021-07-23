import React, { useState } from 'react';

type WeekState = {
  selectDay: (day: string, index: number) => void;
  deselectDay: (day: string) => void;
  isDayOpen: (day: string) => boolean;
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
  // week keeps track of which AvailabilityInput has what days selected, based
  // on its index number. if a day is not selected in any AvailabilityInput
  // instance, the value is -1.
  const [week, setWeek] = useState<WeekType>({
    Sun: -1,
    Mon: -1,
    Tue: -1,
    Wed: -1,
    Thu: -1,
    Fri: -1,
    Sat: -1,
  });

  const setDay = (day: string, value: number) => {
    setWeek((prev) => ({ ...prev, [day]: value }));
  };

  const selectDay = (day: string, index: number) => setDay(day, index);

  const deselectDay = (day: string) => setDay(day, -1);

  const isDayOpen = (day: string) => week[day] === -1;

  const isDaySelectedByInstance = (day: string, index: number) =>
    week[day] === index;

  const getSelectedDays = (index: number) =>
    Object.keys(week).filter((day) => week[day] === index);

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
