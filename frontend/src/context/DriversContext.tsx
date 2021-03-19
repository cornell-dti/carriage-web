import React, { useState } from 'react';
import { Driver } from '../types';
import { useReq } from './req';


type driversState = {
  drivers: Array<Driver>,
  refreshDrivers: () => Promise<void>
};

const initialState: driversState = {
  drivers: [],
  refreshDrivers: async () => undefined,
};
const DriversContext = React.createContext(initialState);
export const useDrivers = () => React.useContext(DriversContext);

type DriversProviderProps = {
  children: React.ReactNode;
}

export const DriversProvider = ({ children }: DriversProviderProps) => {
  const [drivers, setDrivers] = useState<Array<Driver>>([]);
  const { withDefaults } = useReq();
  const refreshDrivers = async () => {
    const driversData: Array<Driver> = await fetch('/api/drivers', withDefaults())
      .then((res) => res.json())
      .then((data) => data.data);
    setDrivers([...driversData]);
  };
  // Initialize the data
  React.useEffect(() => {
    refreshDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DriversContext.Provider
      value={{
        drivers,
        refreshDrivers,
      }}
    >
      {children}
    </DriversContext.Provider>
  );
};
