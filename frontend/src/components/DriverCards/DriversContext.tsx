import React, { useState } from 'react';
import { Driver } from '../../types';
import { useReq } from '../../context/req';


type driversState = {
    drivers:Array<Driver>, 
    refreshDrivers: () => Promise<void> 
};

const initialState: driversState = {
   drivers: [],
   refreshDrivers: async () =>  undefined
  };
const DriversContext = React.createContext(initialState);
export const useDrivers = () => React.useContext(DriversContext);

type DriversProviderProps = {
  children: React.ReactNode;
}

export const DriversProvider = ({ children }: DriversProviderProps) => {
  const [drivers, setDrivers] = useState<Array<Driver>>([])
  const { withDefaults } = useReq();
  const refreshDrivers = async () => {
    const ridersData:Array<Driver> = await fetch('/api/drivers', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
        
      setDrivers([ ...ridersData]); 
    };
    //Initialize the data
    React.useEffect(()=> {
      refreshDrivers();
    }, []);
  
    return (
      <DriversContext.Provider
        value={{
          drivers, 
          refreshDrivers
        }}
      >
        {children}
      </DriversContext.Provider>
    );
};
  




