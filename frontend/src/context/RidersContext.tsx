import React, { useState } from 'react';
import { NewRider } from '../types';
import { useReq } from './req';


type ridersState = {
    riders:Array<NewRider>, 
    refreshRiders: () => Promise<void> 
};

const initialState: ridersState = {
   riders: [],
   refreshRiders: async () =>  undefined
  };
const RidersContext = React.createContext(initialState);
export const useRiders = () => React.useContext(RidersContext);

type RidersProviderProps = {
  children: React.ReactNode;
}

export const RidersProvider = ({ children }: RidersProviderProps) => {
  const [riders, setRiders] = useState<Array<NewRider>>([])
  const { withDefaults } = useReq();
  const refreshRiders = async () => {
    const ridersData:Array<NewRider> = await fetch('/api/riders', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
        
      setRiders([ ...ridersData]); 
    };
    //Initialize the data
    React.useEffect(()=> {
      refreshRiders();
    }, []);
  
    return (
      <RidersContext.Provider
        value={{
          riders, 
          refreshRiders
        }}
      >
        {children}
      </RidersContext.Provider>
    );
};
  




