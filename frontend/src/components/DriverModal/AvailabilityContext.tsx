import React, { useState } from 'react';

type AvailabilityState = {
  selectDay: (day: string, index: number) => void;
  deselectDay: (day: string) => void;
  isDayOpen: (day: string) => boolean;
  isDaySelectedByInstance: (day: string, index: number) => boolean;
  getSelectedDays: (index: number) => string[];
};

const initialState: AvailabilityState = {
  selectDay: () => { },
  deselectDay: () => { },
  isDayOpen: () => false,
  isDaySelectedByInstance: () => false,
  getSelectedDays: () => [],
};

const AvailabilityContext = React.createContext(initialState);

export const useAvailability = () => React.useContext(AvailabilityContext);

type AvailabilityProviderProps = {
  children: React.ReactNode;
}

type AvailabilityType = {
  [day: string]: number;
};

export const AvailabilityProvider = ({ children }: AvailabilityProviderProps) => {
  // availability keeps track of which HourInput has what days selected, based
  // on its index number. if a day is not selected in any HourInput instance,
  // the value is -1.
  const [availability, setAvailability] = useState<AvailabilityType>({
    Sun: -1,
    Mon: -1,
    Tue: -1,
    Wed: -1,
    Thu: -1,
    Fri: -1,
    Sat: -1,
  });

  const setDay = (day: string, value: number) => {
    setAvailability((prev) => ({ ...prev, [day]: value }));
  };

  const selectDay = (day: string, index: number) => setDay(day, index);

  const deselectDay = (day: string) => setDay(day, -1);

  const isDayOpen = (day: string) => availability[day] === -1;

  const isDaySelectedByInstance = (day: string, index: number) => (
    availability[day] === index
  );

  const getSelectedDays = (index: number) => (
    Object.keys(availability).filter((day) => availability[day] === index)
  );

  return (
    <AvailabilityContext.Provider
      value={{
        selectDay,
        deselectDay,
        isDayOpen,
        isDaySelectedByInstance,
        getSelectedDays,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
};
