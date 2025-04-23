import React, { useCallback, useState, useRef } from 'react';
import { Rider } from '../types';
import axios from '../util/axios';
import { MOCK_RIDERS } from '../util/mocking';

type ridersState = {
  riders: Array<Rider>;
  refreshRiders: () => Promise<void>;
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
  const refreshRiders = useCallback(async () => {
    const ridersData: Array<Rider> = await axios
      .get('/api/riders')
      .then((res) => res.data)
      .then((data) => data.data);

    // const ridersData = MOCK_RIDERS;
    ridersData &&
      ridersData.sort((a: Rider, b: Rider) => {
        const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
        return aFull < bFull ? -1 : 1;
      });
    ridersData && componentMounted.current && setRiders(ridersData);
  }, []);

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
