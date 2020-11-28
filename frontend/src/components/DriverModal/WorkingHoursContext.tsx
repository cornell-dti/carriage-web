import React, { useCallback, useState } from 'react';

type WorkingHoursState = {
  availability: {
    [day: string]: {
      startTime?: string;
      endTime?: string;
    };
  };
  clearDay: (day: string) => void;
  updateDays: (days: string[], startTime: string, endTime: string) => void;
  isDaySelected: (day: string) => boolean;
};

const initialState: WorkingHoursState = {
  availability: {
    Sun: {},
    Mon: {},
    Tue: {},
    Wed: {},
    Thu: {},
    Fri: {},
    Sat: {},
  },
  clearDay: () => { },
  updateDays: () => { },
  isDaySelected: () => false,
};

const WorkingHoursContext = React.createContext(initialState);

export const useWorkingHours = () => React.useContext(WorkingHoursContext);

type WorkingHoursProviderProps = {
  children: React.ReactNode;
}

export const WorkingHoursProvider = ({ children }: WorkingHoursProviderProps) => {
  const [availability, setAvailability] = useState(initialState.availability);

  const clearDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: {} }));
  };

  // Not sure why useCallback is needed but without it an infinite loop happens
  const updateDays = useCallback((days: string[], startTime: string, endTime: string) => {
    setAvailability((prev) => {
      const newState = prev;
      days.forEach((day) => {
        newState[day] = { startTime, endTime };
      });
      return { ...newState };
    });
  }, []);

  const isDaySelected = (day: string) => Object.keys(availability[day]).length !== 0;

  return (
    <WorkingHoursContext.Provider
      value={{
        availability,
        clearDay,
        updateDays,
        isDaySelected,
      }}
    >
      {children}
    </WorkingHoursContext.Provider>
  );
};
