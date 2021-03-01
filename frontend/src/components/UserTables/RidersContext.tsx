import React, { useState } from 'react';
import { Rider } from '../../types';
import { useReq } from '../../context/req';


type ridersState = {
    riders:Array<Rider>, 
    refreshRiders: () => Promise<void> 
};

const initialState: ridersState = {
   riders: [],
   refreshRiders: async () =>  undefined
  };
const RidersContext = React.createContext(initialState);
export const useRiders = () => React.useContext(RidersContext);

type RidesProviderProps = {
  children: React.ReactNode;
}

export const RidesProvider = ({ children }: RidesProviderProps) => {
  const [riders, setRiders] = useState<Array<Rider>>([])
  const { withDefaults } = useReq();
  const refreshRiders = async () => {
    const ridersData:Array<Rider> = await fetch('/api/riders', withDefaults())
        .then((res) => res.json())
        .then((data) => data.data);
        
      setRiders([ ...ridersData]); 
    };
    //Initialize the data
    React.useEffect(()=> {
      refreshRiders();
    });
  
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
  




