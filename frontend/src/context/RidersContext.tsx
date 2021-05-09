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
    ridersData && ridersData.sort((a: Rider, b: Rider) => {
      const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
      return aFull < bFull ? -1 : 1;
    });
    ridersData && setRiders([...ridersData]);
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
