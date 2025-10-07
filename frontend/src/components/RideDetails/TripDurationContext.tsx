import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Represents the duration of a trip
 */

interface TripDuration {
  duration?: number; // in minutes
}

/**
 * Context type definition for trip duration management
 */
interface TripDurationContextType {
  //Current trip duration state
  tripDuration: TripDuration;

  //Function to update the trip duration state
  setTripDuration: React.Dispatch<React.SetStateAction<TripDuration>>;
}

/**
 * Context for managing trip duration across the application
 */
const TripDurationContext = createContext<TripDurationContextType | undefined>(
  undefined
);

/**
 * Provider component that wraps the application to provide trip duration state management
 */
export const TripDurationProvider = ({ children }: { children: ReactNode }) => {
  const [tripDuration, setTripDuration] = useState<TripDuration>({});

  return (
    <TripDurationContext.Provider value={{ tripDuration, setTripDuration }}>
      {children}
    </TripDurationContext.Provider>
  );
};

/**
 * Custom hook to access and modify trip duration state
 *
 * @throws {Error} Throws an error if used outside of TripDurationProvider
 * @returns Object containing tripDuration state and setTripDuration setter function
 */
export const useTripDuration = (): TripDurationContextType => {
  const context = useContext(TripDurationContext);
  if (!context) {
    throw new Error(
      'useTripDuration must be used within a TripDurationProvider'
    );
  }
  return context;
};
