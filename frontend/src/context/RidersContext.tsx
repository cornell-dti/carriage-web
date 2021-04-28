import React, { useState } from 'react';
import { Rider } from '../types';
import { useReq } from './req';

type ridersState = {
<<<<<<< HEAD
  riders: Array<Rider>,
  refreshRiders: () => Promise<void>
=======
  riders: Array<NewRider>;
  refreshRiders: () => Promise<void>;
>>>>>>> a27ac5d70301c1b98004eb3d3884efd9b12954d6
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
<<<<<<< HEAD
    const ridersData: Array<Rider> = await fetch('/api/riders', withDefaults())
=======
    const ridersData: Array<NewRider> = await fetch(
      '/api/riders',
      withDefaults(),
    )
>>>>>>> a27ac5d70301c1b98004eb3d3884efd9b12954d6
      .then((res) => res.json())
      .then((data) => data.data);
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
