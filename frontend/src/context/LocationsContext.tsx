import React, { useRef, useState, useCallback } from 'react';
import { Admin, Location } from '../types';
import { useReq } from './req';

type locationsState = {
  locations: Array<Location>;
  refreshLocations: () => Promise<void>;
};

const initialState: locationsState = {
  locations: [],
  refreshLocations: async () => undefined,
};

const LocationsContext = React.createContext(initialState);
export const useLocations = () => React.useContext(LocationsContext);

type locationsProviderProps = {
  children: React.ReactNode;
};

export const LocationsProvider = ({ children }: locationsProviderProps) => {
  const [locations, setLocations] = useState<Array<Location>>([]);
  const { withDefaults } = useReq();
  const refreshLocations = useCallback(async () => {
    const locationsData: Array<Location> = await fetch(
      '/api/locations',
      withDefaults()
    )
      .then((res) => res.json())
      .then((data) => data.data);
    if (locationsData) {
      locationsData.sort((a: Location, b: Location) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      });
      setLocations(locationsData);
    }
  }, [withDefaults]);

  React.useEffect(() => {
    refreshLocations();
  }, []);

  return (
    <LocationsContext.Provider value={{ locations, refreshLocations }}>
      {children}
    </LocationsContext.Provider>
  );
};
