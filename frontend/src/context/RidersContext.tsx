import React, { useCallback, useState, useRef } from 'react';
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
  const componentMounted = useRef(true);
  const [riders, setRiders] = useState<Array<Rider>>([]);
  const { withDefaults } = useReq();
  const refreshRiders = useCallback(async () => {
    const ridersData: Array<Rider> = await fetch('/api/riders', withDefaults())
      .then((res) => res.json())
      .then((data) => data.data);
    ridersData && ridersData.sort((a: Rider, b: Rider) => {
      const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
      return aFull < bFull ? -1 : 1;
    });
    ridersData && componentMounted.current && setRiders(ridersData);
  }, [withDefaults]);

  React.useEffect(() => {
    refreshRiders();

    return () => {
      componentMounted.current = false;
    };
  }, [refreshRiders]);

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
