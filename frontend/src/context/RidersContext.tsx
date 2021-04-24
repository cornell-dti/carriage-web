import React, { useState } from 'react';
import { Rider } from '../types';
import { useReq } from './req';

type ridersState = {
  riders: Array<Rider>,
  refreshRiders: () => Promise<void>
};

const initialState: ridersState = {
  riders: [],
  refreshRiders: async () => undefined,
};
const RidersContext = React.createContext(initialState);
export const useRiders = () => React.useContext(RidersContext);

type RidersProviderProps = {
  children: React.ReactNode;
};

export const RidersProvider = ({ children }: RidersProviderProps) => {
  const [riders, setRiders] = useState<Array<Rider>>([]);
  const { withDefaults } = useReq();
  const refreshRiders = async () => {
    const ridersData: Array<Rider> = await fetch('/api/riders', withDefaults())
      .then((res) => res.json())
      .then((data) => data.data);
    ridersData.sort((a: NewRider, b: NewRider) => {
      if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) { return -1; }
      if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) { return 1; }
      return 0;
    });
    setRiders([...ridersData]);
  };
  // Initialize the data
  React.useEffect(() => {
    refreshRiders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RidersContext.Provider
      value={{
        riders,
        refreshRiders,
      }}
    >
      {children}
    </RidersContext.Provider>
  );
};
