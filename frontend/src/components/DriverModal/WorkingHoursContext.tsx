import React, { useCallback, useState } from 'react';

type WorkingHoursState = {
  availability: {
    [day: string]: boolean;
  };
  toggleDay: (day: string) => void;
  isDaySelected: (day: string) => boolean;
};

const initialState: WorkingHoursState = {
  availability: {
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  },
  toggleDay: () => { },
  isDaySelected: () => false,
};

const WorkingHoursContext = React.createContext(initialState);

export const useWorkingHours = () => React.useContext(WorkingHoursContext);

type WorkingHoursProviderProps = {
  children: React.ReactNode;
}

export const WorkingHoursProvider = ({ children }: WorkingHoursProviderProps) => {
  const [availability, setAvailability] = useState(initialState.availability);

  const toggleDay = useCallback((day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const isDaySelected = (day: string) => availability[day];

  return (
    <WorkingHoursContext.Provider
      value={{
        availability,
        toggleDay,
        isDaySelected,
      }}
    >
      {children}
    </WorkingHoursContext.Provider>
  );
};
